from rest_framework import status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from workflow.middleware.permissions import IsAuthenticatedEmployee
from workflow.models import EmployeeRole, EmployeeStatus, Lead, LeadStatus
from workflow.serializers.lead_serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticatedEmployee]

    def get_queryset(self):
        user = self.request.user
        queryset = Lead.objects.select_related("owner", "created_by", "updated_by")

        role = user.employee_profile.role
        if role == EmployeeRole.ADMIN:
            return queryset

        if role == EmployeeRole.SALES:
            return queryset.filter(owner=user)

        if role == EmployeeRole.PROJECT_MANAGER:
            return queryset.filter(status=LeadStatus.NEGOTIATION)

        return queryset.none()

    def _is_suspended(self, request: Request) -> bool:
        return request.user.employee_profile.account_status == EmployeeStatus.SUSPEND

    def create(self, request: Request, *args, **kwargs) -> Response:
        if self._is_suspended(request):
            return Response(
                {"success": False, "error": "Your account is suspended. You have read-only access. Contact HR."},
                status=status.HTTP_403_FORBIDDEN,
            )
        role = request.user.employee_profile.role
        if role not in (EmployeeRole.ADMIN, EmployeeRole.SALES):
            return Response(
                {"success": False, "error": "Only Sales or Admin can create leads."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def update(self, request: Request, *args, **kwargs) -> Response:
        if self._is_suspended(request):
            return Response(
                {"success": False, "error": "Your account is suspended. You have read-only access. Contact HR."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        if self._is_suspended(request):
            return Response(
                {"success": False, "error": "Your account is suspended. You have read-only access. Contact HR."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        if self._is_suspended(request):
            return Response(
                {"success": False, "error": "Your account is suspended. You have read-only access. Contact HR."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
