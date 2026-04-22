# Generated manually for initial project scaffold.
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ContactSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("email", models.EmailField(max_length=254)),
                ("subject", models.CharField(max_length=200)),
                ("message", models.TextField()),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("is_read", models.BooleanField(default=False)),
            ],
            options={"ordering": ["-submitted_at"]},
        ),
        migrations.CreateModel(
            name="Project",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("category", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("tech_stack", models.JSONField(default=list)),
                ("image", models.ImageField(blank=True, null=True, upload_to="projects/")),
                ("live_url", models.URLField(blank=True)),
                ("github_url", models.URLField(blank=True)),
                ("is_featured", models.BooleanField(default=False)),
                ("order", models.IntegerField(default=0)),
            ],
            options={"ordering": ["order", "id"]},
        ),
        migrations.CreateModel(
            name="Testimonial",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("client_name", models.CharField(max_length=100)),
                ("company", models.CharField(max_length=100)),
                ("review", models.TextField()),
                ("rating", models.IntegerField(default=5)),
                ("avatar_initials", models.CharField(max_length=3)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["id"]},
        ),
    ]
