from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from workflow.models import EmployeeProfile, EmployeeRole, EmployeeStatus


class Command(BaseCommand):
    help = "Creates the superadmin employee account on MongoDB"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        username = "superadmin"
        email = "superadmin@nextgenwebailabs.com"
        password = "NextGen@2026!Admin"

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists — skipped."))
            return

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name="Super",
            last_name="Admin",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )

        EmployeeProfile.objects.create(
            user=user,
            role=EmployeeRole.ADMIN,
            account_status=EmployeeStatus.ACTIVE,
            is_active_employee=True,
            is_suspend=False,
        )

        self.stdout.write(self.style.SUCCESS(
            f"Superadmin employee created: username={username} | email={email}"
        ))
