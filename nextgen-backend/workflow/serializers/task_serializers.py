from django.utils import timezone
from rest_framework import serializers

from workflow.models import EmployeeRole, Task, TaskStatus, WorkflowProject
from django.contrib.auth import get_user_model
from bson import ObjectId

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    project = serializers.CharField()
    assigned_to = serializers.CharField(allow_null=True, required=False)
    milestone = serializers.CharField(allow_null=True, required=False)

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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["project"] = str(instance.project_id) if instance.project_id else None
        data["assigned_to"] = str(instance.assigned_to_id) if instance.assigned_to_id else None
        data["milestone"] = str(instance.milestone_id) if instance.milestone_id else None
        return data

    def validate(self, attrs):
        assigned_to = attrs.get("assigned_to")
        if assigned_to is not None:
            profile = getattr(assigned_to, "employee_profile", None)
            if profile is None:
                raise serializers.ValidationError("Assigned user must be an active employee.")
            if profile.role not in (EmployeeRole.DEVELOPER, EmployeeRole.ADMIN):
                raise serializers.ValidationError("Tasks can only be assigned to Developer or Admin roles.")
        return attrs

    def validate_assigned_to(self, value):
        if value is None:
            return None
        try:
            return User.objects.get(id=ObjectId(value))
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid user ID")

    def update(self, instance, validated_data):
        from django.utils import timezone as tz

        status_value = validated_data.get("status", instance.status)

        if status_value == TaskStatus.IN_PROGRESS and instance.started_at is None:
            instance.started_at = tz.now()

        if status_value == TaskStatus.DONE:
            instance.completed_at = tz.now()
        elif status_value in (TaskStatus.TODO, TaskStatus.IN_PROGRESS):
            instance.completed_at = None

        update_fields = ["updated_at"]

        if "status" in validated_data:
            instance.status = status_value
            update_fields += ["status", "started_at", "completed_at"]

        if "assigned_to" in validated_data:
            instance.assigned_to = validated_data["assigned_to"]
            update_fields.append("assigned_to")

        if "title" in validated_data:
            instance.title = validated_data["title"]
            update_fields.append("title")

        if "description" in validated_data:
            instance.description = validated_data["description"]
            update_fields.append("description")

        if "priority" in validated_data:
            instance.priority = validated_data["priority"]
            update_fields.append("priority")

        if "due_date" in validated_data:
            instance.due_date = validated_data["due_date"]
            update_fields.append("due_date")

        if "estimated_hours" in validated_data:
            instance.estimated_hours = validated_data["estimated_hours"]
            update_fields.append("estimated_hours")

        if "actual_hours" in validated_data:
            instance.actual_hours = validated_data["actual_hours"]
            update_fields.append("actual_hours")

        instance.save(update_fields=list(set(update_fields)))
        instance.project.refresh_progress()
        return instance

    def create(self, validated_data):
        request = self.context["request"]

        project_id = validated_data.get("project")
        if project_id:
            validated_data["project"] = WorkflowProject.objects.get(id=ObjectId(project_id))

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
