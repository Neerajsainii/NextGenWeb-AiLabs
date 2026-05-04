from django.urls import path

from workflow.controllers.dashboard_controller import DashboardView

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="workflow-dashboard"),
]
