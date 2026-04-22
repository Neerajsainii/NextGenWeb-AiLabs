from django.conf import settings
from django.core.mail import send_mail


def send_contact_notification(
    *, name: str, email: str, subject: str, message: str
) -> None:
    email_subject = f"New Contact Submission: {subject}"
    email_body = (
        "You received a new contact request from your website.\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Subject: {subject}\n\n"
        "Message:\n"
        f"{message}\n"
    )

    send_mail(
        subject=email_subject,
        message=email_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.CONTACT_RECEIVER_EMAIL],
        fail_silently=False,
    )
