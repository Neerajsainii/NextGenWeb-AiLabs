from django.db import transaction
from rest_framework import serializers

from workflow.models import EmployeeRole, Lead, LeadStatus
from workflow.services.workflow_service import create_project_from_negotiation_lead


class LeadSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "title",
            "company_name",
            "contact_name",
            "contact_email",
            "contact_phone",
            "requirements",
            "estimated_value",
            "status",
            "owner",
            "owner_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at", "owner_username"]

    def validate_status(self, value: str) -> str:
        valid_values = {choice[0] for choice in LeadStatus.choices}
        if value not in valid_values:
            raise serializers.ValidationError("Invalid lead status.")
        return value

    def validate_estimated_value(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("estimated_value cannot be negative.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        role = request.user.employee_profile.role

        # Sales can move only to negotiation; PM closes negotiation to won/lost.
        if self.instance is not None and "status" in attrs:
            previous = self.instance.status
            next_status = attrs["status"]

            if role == EmployeeRole.SALES:
                allowed_transitions = {
                    LeadStatus.NEW: {LeadStatus.NEW, LeadStatus.QUALIFIED},
                    LeadStatus.QUALIFIED: {LeadStatus.QUALIFIED, LeadStatus.NEGOTIATION},
                    LeadStatus.NEGOTIATION: {LeadStatus.NEGOTIATION},
                    LeadStatus.WON: {LeadStatus.WON},
                    LeadStatus.LOST: {LeadStatus.LOST},
                }
                if next_status not in allowed_transitions.get(previous, {previous}):
                    raise serializers.ValidationError(
                        "Sales can only move lead status from new->qualified->negotiation."
                    )

            if role == EmployeeRole.PROJECT_MANAGER:
                non_status_fields = set(attrs.keys()) - {"status"}
                if non_status_fields:
                    raise serializers.ValidationError(
                        "Project Manager can update only lead status in negotiation phase."
                    )
                if previous != LeadStatus.NEGOTIATION:
                    raise serializers.ValidationError(
                        "Project Manager can update lead status only for negotiation leads."
                    )
                if next_status not in {LeadStatus.NEGOTIATION, LeadStatus.WON, LeadStatus.LOST}:
                    raise serializers.ValidationError(
                        "Project Manager can set negotiation leads to won or lost only."
                    )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        validated_data["created_by"] = request.user
        validated_data.setdefault("owner", request.user)
        lead = super().create(validated_data)

        if lead.status == LeadStatus.NEGOTIATION:
            create_project_from_negotiation_lead(lead=lead, created_by=request.user)

        return lead

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context["request"]
        validated_data["updated_by"] = request.user

        previous_status = instance.status
        lead = super().update(instance, validated_data)

        if previous_status != LeadStatus.NEGOTIATION and lead.status == LeadStatus.NEGOTIATION:
            create_project_from_negotiation_lead(lead=lead, created_by=request.user)

        if previous_status == LeadStatus.NEGOTIATION and lead.status in (LeadStatus.WON, LeadStatus.LOST):
            if hasattr(lead, "converted_project"):
                project = lead.converted_project
                if project.project_manager_id is None and request.user.employee_profile.role == EmployeeRole.PROJECT_MANAGER:
                    project.project_manager = request.user
                if lead.status == LeadStatus.LOST:
                    project.status = "cancelled"
                project.save(update_fields=["project_manager", "status", "updated_at"])

        return lead
