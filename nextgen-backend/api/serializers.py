from rest_framework import serializers

from .models import ContactSubmission, Project, Testimonial


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ["id", "name", "email", "subject", "message", "submitted_at"]
        read_only_fields = ["id", "submitted_at"]

    def validate_message(self, value: str) -> str:
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Message must be at least 20 characters.")
        return value


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "category",
            "description",
            "tech_stack",
            "image",
            "live_url",
            "github_url",
            "is_featured",
            "order",
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            "id",
            "client_name",
            "company",
            "review",
            "rating",
            "avatar_initials",
            "is_active",
        ]
