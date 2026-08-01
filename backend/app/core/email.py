import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv(
    "SMTP_FROM_NAME",
    "Expense Tracker",
)

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"

template_environment = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
)


def render_email_template(
    template_name: str,
    **context,
) -> str:
    """
    Render an HTML email template.
    """

    template = template_environment.get_template(template_name)

    return template.render(**context)


def send_email(
    recipient_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
):
    """
    Send an email using Brevo SMTP.
    """

    message = EmailMessage()

    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    message["To"] = recipient_email
    message["Subject"] = subject

    message.set_content(body)

    if html_body:
        message.add_alternative(
            html_body,
            subtype="html",
        )

    try:
        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=30,
        ) as server:

            server.ehlo()

            server.starttls()

            server.ehlo()

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD,
            )

            server.send_message(message)

    except smtplib.SMTPAuthenticationError as e:
        raise Exception(f"SMTP Authentication Failed: {e}")

    except smtplib.SMTPException as e:
        raise Exception(f"SMTP Error: {e}")

    except Exception as e:
        raise Exception(f"Email sending failed: {e}")
