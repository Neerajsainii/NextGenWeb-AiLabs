from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from workflow.middleware.permissions import IsAuthenticatedEmployee
from workflow.models import EmployeeRole
from workflow.services.workflow_service import calculate_admin_metrics, calculate_role_metrics


class DashboardView(APIView):
    permission_classes = [IsAuthenticatedEmployee]

    def get(self, request: Request) -> Response:
        role = request.user.employee_profile.role

        metrics = calculate_role_metrics(request.user)
        if role == EmployeeRole.ADMIN:
            metrics = {
                **calculate_admin_metrics(),
                **metrics,
            }

        return Response(
            {
                "success": True,
                "role": role,
                "metrics": metrics,
            },
            status=status.HTTP_200_OK,
        )
