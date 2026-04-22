from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ContactSubmissionCreateView,
    ProjectViewSet,
    ServicesListView,
    TestimonialListView,
)

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("", include(router.urls)),
    path("contact/", ContactSubmissionCreateView.as_view(), name="contact-submit"),
    path("services/", ServicesListView.as_view(), name="services-list"),
    path("testimonials/", TestimonialListView.as_view(), name="testimonials-list"),
]
