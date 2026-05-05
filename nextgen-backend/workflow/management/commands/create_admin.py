from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from workflow.models import EmployeeProfile, EmployeeRole, EmployeeStatus


class Command(BaseCommand):
    help = "Creates the superadmin employee account on MongoDB"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        username = "superadmin3"
        email = "superadmin3@nextgenwebailabs.com"
        password = "123456"

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists — skipped."))
            return

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": "Super",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"User '{username}' created."))
        else:
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists."))

        EmployeeProfile.objects.update_or_create(
            user=user,
            defaults={
                "role": EmployeeRole.ADMIN,
                "account_status": EmployeeStatus.ACTIVE,
                "is_active_employee": True,
                "is_suspend": False,
            },
        )

        self.stdout.write(self.style.SUCCESS(
            f"Superadmin ensured: username={username} | email={email}"
))
