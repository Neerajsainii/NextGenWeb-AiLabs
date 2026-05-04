from django.utils import timezone
from rest_framework import serializers

from workflow.models import EmployeeRole, Task, TaskStatus


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "project_name",
            "milestone",
            "title",
            "description",
            "assigned_to",
            "assigned_to_username",
            "status",
            "priority",
            "due_date",
            "started_at",
            "completed_at",
            "estimated_hours",
            "actual_hours",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project_name", "assigned_to_username", "created_at", "updated_at"]

    def validate(self, attrs):
        assigned_to = attrs.get("assigned_to")
        if assigned_to is not None:
            profile = getattr(assigned_to, "employee_profile", None)
            if profile is None:
                raise serializers.ValidationError("Assigned user must be an active employee.")
            if profile.role not in (EmployeeRole.DEVELOPER, EmployeeRole.ADMIN):
                raise serializers.ValidationError("Tasks can only be assigned to Developer or Admin roles.")
        return attrs

    def update(self, instance, validated_data):
        status_value = validated_data.get("status")

        if status_value == TaskStatus.IN_PROGRESS and instance.started_at is None:
            validated_data["started_at"] = timezone.now()

        if status_value == TaskStatus.DONE:
            validated_data["completed_at"] = timezone.now()
        elif status_value in (TaskStatus.TODO, TaskStatus.IN_PROGRESS):
            validated_data["completed_at"] = None

        task = super().update(instance, validated_data)
        task.project.refresh_progress()
        return task

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["created_by"] = request.user
        task = super().create(validated_data)
        task.project.refresh_progress()
        return task


class DeveloperTaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["status", "actual_hours"]

    def update(self, instance, validated_data):
        status_value = validated_data.get("status", instance.status)

        if status_value == TaskStatus.IN_PROGRESS and instance.started_at is None:
            instance.started_at = timezone.now()

        if status_value == TaskStatus.DONE:
            instance.completed_at = timezone.now()
        elif status_value in (TaskStatus.TODO, TaskStatus.IN_PROGRESS):
            instance.completed_at = None

        instance.status = status_value
        if "actual_hours" in validated_data:
            instance.actual_hours = validated_data["actual_hours"]

        instance.save(update_fields=["status", "actual_hours", "started_at", "completed_at", "updated_at"])
        instance.project.refresh_progress()
        return instance
