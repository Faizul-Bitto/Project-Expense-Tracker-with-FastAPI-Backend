import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader

from app.core.logger import logger

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_FROM_NAME = os.getenv(
    "EMAIL_FROM_NAME",
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


def verify_email_connection():
    """
    Verify Brevo API connectivity.
    """

    logger.info("📧 Verifying Brevo API...")

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
    }

    response = requests.get(
        "https://api.brevo.com/v3/account",
        headers=headers,
        timeout=30,
    )

    response.raise_for_status()

    logger.info("✅ Brevo API Connected Successfully")


def send_email(
    recipient_email: str,
    subject: str,
    body: str,
    html_body: str | None = None,
):
    """
    Send email using Brevo API.
    """

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    payload = {
        "sender": {
            "name": EMAIL_FROM_NAME,
            "email": EMAIL_FROM,
        },
        "to": [
            {
                "email": recipient_email,
            }
        ],
        "subject": subject,
        "textContent": body,
    }

    if html_body:
        payload["htmlContent"] = html_body

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers=headers,
        json=payload,
        timeout=30,
    )

    if response.status_code >= 400:
        logger.error(response.text)
        raise Exception(f"Brevo Error {response.status_code}: {response.text}")

    logger.info(f"📨 Email sent successfully to {recipient_email}")
