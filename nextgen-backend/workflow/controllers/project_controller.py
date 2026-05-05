from rest_framework import viewsets
from django.db.models import Q

from workflow.middleware.permissions import IsAuthenticatedEmployee, IsProjectManagerOrAdmin
from workflow.models import EmployeeRole, LeadStatus, WorkflowProject
from workflow.serializers.project_serializers import WorkflowProjectSerializer


class WorkflowProjectViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowProjectSerializer
    permission_classes = [IsAuthenticatedEmployee, IsProjectManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = WorkflowProject.objects.select_related("project_manager", "sales_owner", "source_lead")

        if user.employee_profile.role == EmployeeRole.ADMIN:
            return queryset

        return queryset.filter(
            Q(project_manager=user)
            | Q(project_manager__isnull=True, source_lead__status__in=[LeadStatus.NEGOTIATION, LeadStatus.WON])
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        if user.employee_profile.role == EmployeeRole.ADMIN:
            serializer.save(sales_owner=user, project_manager=user)
            return
        if user.employee_profile.role == EmployeeRole.PROJECT_MANAGER:
            serializer.save(project_manager=user)
            return
        serializer.save()
