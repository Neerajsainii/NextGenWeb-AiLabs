from django.urls import include, path

urlpatterns = [
    path("auth/", include("workflow.routes.auth_routes")),
    path("", include("workflow.routes.lead_routes")),
    path("", include("workflow.routes.project_routes")),
    path("", include("workflow.routes.task_routes")),
    path("", include("workflow.routes.dashboard_routes")),
]
