from django.urls import include, path
from rest_framework.routers import DefaultRouter

from workflow.controllers.task_controller import (
    DeveloperTaskListView,
    DeveloperTaskUpdateView,
    TaskViewSet,
)

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="workflow-task")

urlpatterns = [
    path("", include(router.urls)),
    path("developer/tasks/", DeveloperTaskListView.as_view(), name="workflow-developer-task-list"),
    path(
        "developer/tasks/<int:task_id>/",
        DeveloperTaskUpdateView.as_view(),
        name="workflow-developer-task-update",
    ),
]
