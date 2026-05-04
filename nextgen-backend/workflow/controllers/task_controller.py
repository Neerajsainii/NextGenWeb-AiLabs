from rest_framework import status, viewsets
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from workflow.middleware.permissions import (
    IsAuthenticatedEmployee,
    IsDeveloperOrAdmin,
    IsProjectManagerOrAdmin,
)
from workflow.models import EmployeeRole, LeadStatus, Task, WorkflowProject
from workflow.serializers.task_serializers import (
    DeveloperTaskUpdateSerializer,
    TaskSerializer,
)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticatedEmployee, IsProjectManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.select_related("project", "assigned_to", "milestone")

        if user.employee_profile.role == EmployeeRole.ADMIN:
            return queryset

        return queryset.filter(
            Q(project__project_manager=user)
            | Q(project__project_manager__isnull=True, project__source_lead__status__in=[LeadStatus.NEGOTIATION, LeadStatus.WON])
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        project_id = self.request.data.get("project")
        project = WorkflowProject.objects.filter(id=project_id).first()
        if project is None:
            raise ValidationError("Invalid project.")

        if user.employee_profile.role == EmployeeRole.PROJECT_MANAGER and project.project_manager_id is None:
            project.project_manager = user
            project.save(update_fields=["project_manager", "updated_at"])

        serializer.save()

    def perform_destroy(self, instance: Task) -> None:
        project = instance.project
        instance.delete()
        project.refresh_progress()


class DeveloperTaskListView(APIView):
    permission_classes = [IsAuthenticatedEmployee, IsDeveloperOrAdmin]

    def get(self, request: Request) -> Response:
        user = request.user
        if user.employee_profile.role == EmployeeRole.ADMIN:
            queryset = Task.objects.select_related("project", "assigned_to", "milestone")
        else:
            queryset = Task.objects.filter(assigned_to=user).select_related("project", "assigned_to", "milestone")

        serializer = TaskSerializer(queryset, many=True)
        return Response({"success": True, "results": serializer.data}, status=status.HTTP_200_OK)


class DeveloperTaskUpdateView(APIView):
    permission_classes = [IsAuthenticatedEmployee, IsDeveloperOrAdmin]

    def patch(self, request: Request, task_id: int) -> Response:
        user = request.user
        task = Task.objects.select_related("assigned_to", "project").filter(id=task_id).first()
        if task is None:
            return Response({"success": False, "error": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.employee_profile.role != EmployeeRole.ADMIN and task.assigned_to_id != user.id:
            return Response({"success": False, "error": "You can only update your assigned tasks."}, status=status.HTTP_403_FORBIDDEN)

        serializer = DeveloperTaskUpdateSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"success": True, "task": TaskSerializer(task).data}, status=status.HTTP_200_OK)
