from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from workflow.controllers.auth_controller import (
    EmployeeDirectoryView,
    EmployeeMeView,
    EmployeeUserViewSet,
    LoginView,
    LogoutView,
    ProfileUpdateView,
)

router = DefaultRouter()
router.register("employees", EmployeeUserViewSet, basename="workflow-employee")

urlpatterns = [
    path("login/", LoginView.as_view(), name="workflow-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="workflow-token-refresh"),
    path("logout/", LogoutView.as_view(), name="workflow-logout"),
    path("me/", EmployeeMeView.as_view(), name="workflow-me"),
    path("profile/", ProfileUpdateView.as_view(), name="workflow-profile-update"),
    path("employees/directory/", EmployeeDirectoryView.as_view(), name="workflow-employee-directory"),
    path("", include(router.urls)),
]
