from django.contrib.auth import get_user_model
from rest_framework import serializers

from workflow.models import Lead, Milestone, Task, WorkflowProject

User = get_user_model()


class ObjectIdPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    """PrimaryKeyRelatedField that coerces ObjectId PKs to str on serialization."""

    def to_representation(self, value):
        pk = super().to_representation(value)
        return str(pk) if pk is not None else None


class MilestoneSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Milestone
        fields = ["id", "title", "description", "due_date", "is_completed", "order"]
        read_only_fields = ["id"]


class TaskSummarySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    assigned_to = serializers.CharField(allow_null=True)
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)

    class Meta:
        model = Task
        fields = ["id", "title", "status", "priority", "assigned_to", "assigned_to_username", "due_date"]


class WorkflowProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    source_lead = ObjectIdPrimaryKeyRelatedField(queryset=Lead.objects.all(), required=False, allow_null=True)
    sales_owner = ObjectIdPrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    project_manager = ObjectIdPrimaryKeyRelatedField(
        queryset=User.objects.all(), allow_null=True, required=False
    )
    milestones = MilestoneSerializer(many=True, required=False)
    tasks = TaskSummarySerializer(many=True, read_only=True)
    project_manager_username = serializers.CharField(source="project_manager.username", read_only=True)
    sales_owner_username = serializers.CharField(source="sales_owner.username", read_only=True)
    source_lead_title = serializers.CharField(source="source_lead.title", read_only=True)


    class Meta:
        model = WorkflowProject
        fields = [
            "id",
            "name",
            "description",
            "source_lead",
            "source_lead_title",
            "sales_owner",
            "sales_owner_username",
            "project_manager",
            "project_manager_username",
            "status",
            "progress_percent",
            "start_date",
            "end_date",
            "milestones",
            "tasks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "progress_percent", "created_at", "updated_at"]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Project end_date must be on or after start_date.")
        return attrs

    def create(self, validated_data):
        milestones_data = validated_data.pop("milestones", [])
        request = self.context["request"]
        project = WorkflowProject.objects.create(created_by=request.user, **validated_data)

        for milestone_data in milestones_data:
            Milestone.objects.create(project=project, **milestone_data)

        return project

    def update(self, instance, validated_data):
        milestones_data = validated_data.pop("milestones", None)
        project = super().update(instance, validated_data)

        if milestones_data is not None:
            project.milestones.all().delete()
            for milestone_data in milestones_data:
                Milestone.objects.create(project=project, **milestone_data)

        return project
