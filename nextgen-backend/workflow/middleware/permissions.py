from rest_framework.permissions import SAFE_METHODS, BasePermission

from workflow.models import EmployeeRole, EmployeeStatus


class IsAuthenticatedEmployee(BasePermission):
    message = "Employee authentication required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "employee_profile", None)
        if profile is None:
            return False

        return user.is_active and profile.can_login


class RoleRequiredPermission(BasePermission):
    allowed_roles: tuple[str, ...] = tuple()
    message = "You are not authorized for this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, "employee_profile", None)
        if profile is None or not user.is_active:
            return False

        if not profile.can_login:
            return False

        if profile.account_status == EmployeeStatus.SUSPEND and request.method not in SAFE_METHODS:
            self.message = "Your account is suspended. You have read-only access. Contact HR."
            return False

        if profile.role == EmployeeRole.ADMIN:
            return True

        return profile.role in self.allowed_roles


class IsAdmin(RoleRequiredPermission):
    allowed_roles = (EmployeeRole.ADMIN,)


class IsAdminOrHr(RoleRequiredPermission):
    allowed_roles = (EmployeeRole.HR,)


class IsSalesOrAdmin(RoleRequiredPermission):
    allowed_roles = (EmployeeRole.SALES,)


class IsProjectManagerOrAdmin(RoleRequiredPermission):
    allowed_roles = (EmployeeRole.PROJECT_MANAGER,)


class IsDeveloperOrAdmin(RoleRequiredPermission):
    allowed_roles = (EmployeeRole.DEVELOPER,)
