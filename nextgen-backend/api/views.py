from rest_framework import generics, status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .email_utils import send_contact_notification
from .models import Project, Testimonial
from .serializers import (
    ContactSubmissionSerializer,
    ProjectSerializer,
    TestimonialSerializer,
)


class ContactSubmissionCreateView(APIView):
    def post(self, request: Request) -> Response:
        serializer = ContactSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact = serializer.save()

        send_contact_notification(
            name=contact.name,
            email=contact.email,
            subject=contact.subject,
            message=contact.message,
        )

        return Response(
            {"success": True, "message": "We'll get back to you within 24 hours!"},
            status=status.HTTP_201_CREATED,
        )


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class TestimonialListView(generics.ListAPIView):
    serializer_class = TestimonialSerializer
    queryset = Testimonial.objects.filter(is_active=True)


class ServicesListView(APIView):
    def get(self, request: Request) -> Response:
        services = [
            {
                "id": 1,
                "name": "AI & ML Integration",
                "description": "LLMs, RAG pipelines, chatbots, recommendation engines, and AI agents.",
            },
            {
                "id": 2,
                "name": "SaaS Application Development",
                "description": "End-to-end SaaS platforms with billing and multi-tenancy.",
            },
            {
                "id": 3,
                "name": "Full Stack Web Development",
                "description": "Production-ready React, Next.js, Django, Node.js, and FastAPI applications.",
            },
            {
                "id": 4,
                "name": "Cloud & DevOps",
                "description": "CI/CD, containerization, and deployment on AWS, Azure, and GCloud.",
            },
            {
                "id": 5,
                "name": "Database Architecture",
                "description": "Relational and NoSQL systems optimized for scale and reliability.",
            },
            {
                "id": 6,
                "name": "Email & Notification Integration",
                "description": "Transactional email, push notification, and SMS integrations.",
            },
            {
                "id": 7,
                "name": "UI/UX Design & Frontend",
                "description": "Accessible and animated user interfaces from concept to production.",
            },
            {
                "id": 8,
                "name": "API Development & Integration",
                "description": "REST and GraphQL APIs with third-party service integrations.",
            },
        ]
        return Response(services)
