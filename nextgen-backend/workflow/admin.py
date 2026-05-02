from django.contrib import admin

from .models import EmployeeProfile, Lead, Milestone, Task, WorkflowProject


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "account_status", "is_active_employee", "updated_at")
    list_filter = ("role", "account_status", "is_active_employee")
    search_fields = ("user__username", "user__email")


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("title", "company_name", "status", "owner", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "company_name", "contact_email")


@admin.register(WorkflowProject)
class WorkflowProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "project_manager", "progress_percent", "updated_at")
    list_filter = ("status",)
    search_fields = ("name",)


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "due_date", "is_completed")
    list_filter = ("is_completed",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "assigned_to", "status", "priority", "due_date")
    list_filter = ("status", "priority")
    search_fields = ("title", "project__name")
