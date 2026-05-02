from django.urls import include, path
from rest_framework.routers import DefaultRouter

from workflow.controllers.lead_controller import LeadViewSet

router = DefaultRouter()
router.register("leads", LeadViewSet, basename="workflow-lead")

urlpatterns = [
    path("", include(router.urls)),
]
