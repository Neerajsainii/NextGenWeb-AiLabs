from django.db import migrations, models


def normalize_status_values(apps, schema_editor):
    EmployeeProfile = apps.get_model("workflow", "EmployeeProfile")
    EmployeeProfile.objects.filter(account_status="suspended").update(account_status="suspend")
    EmployeeProfile.objects.filter(account_status="blocked").update(account_status="block")


def reverse_status_values(apps, schema_editor):
    EmployeeProfile = apps.get_model("workflow", "EmployeeProfile")
    EmployeeProfile.objects.filter(account_status="suspend").update(account_status="suspended")
    EmployeeProfile.objects.filter(account_status="block").update(account_status="blocked")


class Migration(migrations.Migration):

    dependencies = [
        ("workflow", "0002_employeeprofile_account_status_and_more"),
    ]

    operations = [
        migrations.RunPython(normalize_status_values, reverse_status_values),
        migrations.AlterField(
            model_name="employeeprofile",
            name="account_status",
            field=models.CharField(
                choices=[("active", "Active"), ("suspend", "Suspend"), ("block", "Block")],
                default="active",
                max_length=20,
            ),
        ),
    ]
