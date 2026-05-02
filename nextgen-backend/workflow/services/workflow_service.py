from typing import Any

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q

from workflow.models import (
    EmployeeProfile,
    EmployeeRole,
    EmployeeStatus,
    Lead,
    LeadStatus,
    TaskStatus,
    WorkflowProject,
)

User = get_user_model()


@transaction.atomic
def create_project_from_negotiation_lead(lead: Lead, created_by: User) -> WorkflowProject:
    if hasattr(lead, "converted_project"):
        return lead.converted_project

    project = WorkflowProject.objects.create(
        name=f"{lead.company_name} - {lead.title}",
        description=lead.requirements,
        source_lead=lead,
        sales_owner=lead.owner,
        created_by=created_by,
        status="planning",
    )
    return project


def create_project_from_won_lead(lead: Lead, created_by: User) -> WorkflowProject:
    # Backward-compatible alias for existing imports.
    return create_project_from_negotiation_lead(lead=lead, created_by=created_by)


def calculate_admin_metrics() -> dict[str, Any]:
    total_leads = Lead.objects.count()
    won_leads = Lead.objects.filter(status=LeadStatus.WON).count()
    conversion_rate = 0.0
    if total_leads > 0:
        conversion_rate = round((won_leads / total_leads) * 100, 2)

    active_projects = WorkflowProject.objects.filter(status__in=["planning", "active", "on_hold"]).count()

    return {
        "total_leads": total_leads,
        "won_leads": won_leads,
        "conversion_rate": conversion_rate,
        "active_projects": active_projects,
    }


def calculate_role_metrics(user: User) -> dict[str, Any]:
    role = getattr(user.employee_profile, "role", None)
    if role == EmployeeRole.HR:
        managed = EmployeeProfile.objects.filter(
            role__in=[EmployeeRole.SALES, EmployeeRole.PROJECT_MANAGER, EmployeeRole.DEVELOPER]
        )
        return {
            "managed_employees": managed.count(),
            "active_employees": managed.filter(account_status=EmployeeStatus.ACTIVE).count(),
            "suspended_employees": managed.filter(account_status=EmployeeStatus.SUSPEND).count(),
            "blocked_employees": managed.filter(account_status=EmployeeStatus.BLOCK).count(),
        }

    if role == EmployeeRole.SALES:
        leads = Lead.objects.filter(owner=user)
        total = leads.count()
        won = leads.filter(status=LeadStatus.WON).count()
        return {
            "total_owned_leads": total,
            "won_leads": won,
            "open_leads": leads.exclude(status__in=[LeadStatus.WON, LeadStatus.LOST]).count(),
        }

    if role == EmployeeRole.PROJECT_MANAGER:
        projects = WorkflowProject.objects.filter(
            Q(project_manager=user)
            | Q(project_manager__isnull=True, source_lead__status__in=[LeadStatus.NEGOTIATION, LeadStatus.WON])
        ).distinct()
        return {
            "managed_projects": projects.count(),
            "active_projects": projects.filter(status__in=["planning", "active", "on_hold"]).count(),
            "completed_projects": projects.filter(status="completed").count(),
        }

    if role == EmployeeRole.DEVELOPER:
        tasks = user.assigned_tasks.all()
        task_counts = tasks.aggregate(
            total=Count("id"),
            todo=Count("id", filter=Q(status=TaskStatus.TODO)),
            in_progress=Count("id", filter=Q(status=TaskStatus.IN_PROGRESS)),
            done=Count("id", filter=Q(status=TaskStatus.DONE)),
        )
        return {
            "assigned_tasks": task_counts["total"],
            "todo_tasks": task_counts["todo"],
            "in_progress_tasks": task_counts["in_progress"],
            "done_tasks": task_counts["done"],
        }

    return {}
