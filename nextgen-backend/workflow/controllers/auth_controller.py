from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from workflow.middleware.permissions import (
    IsAdminOrHr,
    IsAuthenticatedEmployee,
    IsProjectManagerOrAdmin,
)
from workflow.models import EmployeeRole, EmployeeStatus
from workflow.serializers.auth_serializers import (
    EmployeeCreateSerializer,
    EmployeeStatusUpdateSerializer,
    EmployeeUserSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
)

User = get_user_model()


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.employee_profile.role
        access = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "success": True,
                "access": access,
                "refresh": refresh_token,
                "user": EmployeeUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

        secure_cookie = not settings.DEBUG
        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=secure_cookie,
            samesite="Lax",
            max_age=1800,
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=secure_cookie,
            samesite="Lax",
            max_age=86400,
        )

        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticatedEmployee]

    def post(self, request: Request) -> Response:
        refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        response = Response({"success": True}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class EmployeeMeView(APIView):
    permission_classes = [IsAuthenticatedEmployee]

    def get(self, request: Request) -> Response:
        return Response({"success": True, "user": EmployeeUserSerializer(request.user).data})


class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticatedEmployee]

    def patch(self, request: Request) -> Response:
        serializer = ProfileUpdateSerializer(
            instance=request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"success": True, "user": EmployeeUserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class EmployeeDirectoryView(APIView):
    permission_classes = [IsAuthenticatedEmployee, IsProjectManagerOrAdmin]

    def get(self, request: Request) -> Response:
        from workflow.models import EmployeeProfile
        dev_user_ids = list(
            EmployeeProfile.objects
            .filter(role=EmployeeRole.DEVELOPER, account_status=EmployeeStatus.ACTIVE)
            .values_list("user_id", flat=True)
        )
        developers = User.objects.filter(id__in=dev_user_ids, is_active=True)
        return Response(
            {"success": True, "results": EmployeeUserSerializer(developers, many=True).data},
            status=status.HTTP_200_OK,
        )


class EmployeeUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedEmployee, IsAdminOrHr]

    def get_queryset(self):
        from workflow.models import EmployeeProfile
        user = self.request.user
        role = user.employee_profile.role

        if role == EmployeeRole.ADMIN:
            allowed_ids = list(
                EmployeeProfile.objects
                .exclude(role=EmployeeRole.ADMIN)
                .values_list("user_id", flat=True)
            )
        elif role == EmployeeRole.HR:
            allowed_ids = list(
                EmployeeProfile.objects
                .filter(role__in=[EmployeeRole.SALES, EmployeeRole.PROJECT_MANAGER, EmployeeRole.DEVELOPER])
                .values_list("user_id", flat=True)
            )
        else:
            return User.objects.none()

        return User.objects.filter(id__in=allowed_ids).select_related()

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return EmployeeUserSerializer
        if self.action in ("update", "partial_update"):
            return EmployeeStatusUpdateSerializer
        return EmployeeCreateSerializer

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            EmployeeUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        user = self.get_object()
        profile = getattr(user, "employee_profile", None)

        if profile is not None:
            profile.account_status = EmployeeStatus.BLOCK
            profile.is_active_employee = False
            profile.save(update_fields=["account_status", "is_active_employee", "updated_at"])

        user.is_active = False
        user.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)
