from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class EmployeeRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    HR = "hr", "HR"
    SALES = "sales", "Sales"
    PROJECT_MANAGER = "project_manager", "Project Manager"
    DEVELOPER = "developer", "Developer"


class EmployeeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    SUSPEND = "suspend", "Suspend"
    BLOCK = "block", "Block"


class LeadStatus(models.TextChoices):
    NEW = "new", "New"
    QUALIFIED = "qualified", "Qualified"
    NEGOTIATION = "negotiation", "Negotiation"
    WON = "won", "Won"
    LOST = "lost", "Lost"


class ProjectStatus(models.TextChoices):
    PLANNING = "planning", "Planning"
    ACTIVE = "active", "Active"
    ON_HOLD = "on_hold", "On Hold"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class TaskStatus(models.TextChoices):
    TODO = "todo", "To Do"
    IN_PROGRESS = "in_progress", "In Progress"
    DONE = "done", "Done"


class TaskPriority(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"


class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="employee_profile")
    role = models.CharField(max_length=30, choices=EmployeeRole.choices)
    is_active_employee = models.BooleanField(default=True)
    account_status = models.CharField(
        max_length=20,
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"

    @property
    def can_login(self) -> bool:
        return self.is_active_employee and self.account_status in {
            EmployeeStatus.ACTIVE,
            EmployeeStatus.SUSPEND,
        }


class Lead(models.Model):
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True)
    requirements = models.TextField(blank=True)
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=LeadStatus.choices, default=LeadStatus.NEW)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_leads")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_leads")
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="updated_leads",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.company_name} - {self.title}"


class WorkflowProject(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    source_lead = models.OneToOneField(
        Lead,
        on_delete=models.SET_NULL,
        related_name="converted_project",
        null=True,
        blank=True,
    )
    sales_owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="sales_projects",
        null=True,
        blank=True,
    )
    project_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="managed_projects",
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.PLANNING)
    progress_percent = models.PositiveSmallIntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_projects")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name

    def refresh_progress(self) -> None:
        total = self.tasks.count()
        if total == 0:
            progress = 0
        else:
            done = self.tasks.filter(status=TaskStatus.DONE).count()
            progress = int((done / total) * 100)

        if progress != self.progress_percent:
            self.progress_percent = progress
            self.save(update_fields=["progress_percent", "updated_at"])


class Milestone(models.Model):
    project = models.ForeignKey(WorkflowProject, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return f"{self.project.name} - {self.title}"


class Task(models.Model):
    project = models.ForeignKey(WorkflowProject, on_delete=models.CASCADE, related_name="tasks")
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.SET_NULL,
        related_name="tasks",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="assigned_tasks",
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_tasks")
    status = models.CharField(max_length=20, choices=TaskStatus.choices, default=TaskStatus.TODO)
    priority = models.CharField(max_length=20, choices=TaskPriority.choices, default=TaskPriority.MEDIUM)
    due_date = models.DateField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.project.name} - {self.title}"
