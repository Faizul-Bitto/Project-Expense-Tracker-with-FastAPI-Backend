# from app.core.email import render_email_template, send_email

# otp = "483921"
# expiry_minutes = 10

# html_body = render_email_template(
#     "password_reset.html",
#     otp=otp,
#     expiry_minutes=expiry_minutes,
# )

# send_email(
#     recipient_email="faizulbitto123@gmail.com",
#     subject="Password Reset OTP",
#     body=(
#         f"Your password reset OTP is: {otp}\n\n"
#         f"This OTP will expire in {expiry_minutes} minutes."
#     ),
#     html_body=html_body,
# )

# print("✅ Test email sent successfully.")
from app.core.security import generate_temporary_password

print(generate_temporary_password())
