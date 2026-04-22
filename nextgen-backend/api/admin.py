from django.contrib import admin

from .models import ContactSubmission, Project, Testimonial


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "submitted_at", "is_read")
    list_filter = ("is_read", "submitted_at")
    search_fields = ("name", "email", "subject")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_featured", "order")
    list_filter = ("category", "is_featured")
    search_fields = ("title", "category")
    ordering = ("order", "id")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("client_name", "company", "rating", "is_active")
    list_filter = ("is_active", "rating")
    search_fields = ("client_name", "company")
