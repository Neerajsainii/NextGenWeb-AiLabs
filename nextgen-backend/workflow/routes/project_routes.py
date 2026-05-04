from django.urls import include, path
from rest_framework.routers import DefaultRouter

from workflow.controllers.project_controller import WorkflowProjectViewSet

router = DefaultRouter()
router.register("projects", WorkflowProjectViewSet, basename="workflow-project")

urlpatterns = [
    path("", include(router.urls)),
]
