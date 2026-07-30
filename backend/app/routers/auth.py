import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from starlette import status

from app.core.email import render_email_template, send_email
from app.core.logger import logger
from app.core.security import (
    authenticate_user,
    bcrypt_context,
    create_access_token,
    generate_otp,
)
from app.dependencies.auth import login_token_field_dependency
from app.dependencies.database import db_dependency
from app.models.password_reset import PasswordReset
from app.models.user import User
from app.schemas.auth import CreateUserRequest, Token
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOTPRequest,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    """
    Register a new user.

    Creates a new user account after validating that the email
    address is unique.

    Raises:
        HTTPException: If the email is already registered.
    """

    existing_user = (
        db.query(User).filter(User.email == create_user_request.email).first()
    )

    if existing_user:
        logger.warning(
            f"⚠️ Registration Failed | Email={create_user_request.email} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user = User(
        name=create_user_request.name,
        email=create_user_request.email,
        password=bcrypt_context.hash(create_user_request.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(
        f"✅ User Registered | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "message": "User registered successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(form_data: login_token_field_dependency, db: db_dependency):
    """
    Authenticate a user and return a JWT access token.

    Raises:
        HTTPException: If the credentials are invalid.
    """

    user = authenticate_user(
        email=form_data.username,
        password=form_data.password,
        db=db,
    )

    if not user:
        logger.warning(f"❌ Login Failed | Email={form_data.username}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(
        email=user.email,
        user_id=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    logger.info(
        f"🔐 User Logged In | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    forgot_password_request: ForgotPasswordRequest,
    db: db_dependency,
):
    """
    Send a password reset OTP to the user's email.
    """

    email = forgot_password_request.email

    user = db.query(User).filter(User.email == email).first()

    # Do not reveal whether the email exists.
    if not user:
        logger.warning(f"⚠️ Password Reset Requested | " f"Email={email} not found.")

        return {
            "message": (
                "If the email is registered, " "a password reset OTP has been sent."
            ),
        }

    # Invalidate previous unused reset requests.
    db.query(PasswordReset).filter(
        PasswordReset.user_id == user.id,
        PasswordReset.used.is_(False),
    ).update(
        {
            PasswordReset.used: True,
        }
    )

    otp = generate_otp()

    otp_hash = bcrypt_context.hash(otp)

    expires_at = datetime.utcnow() + timedelta(minutes=10)

    password_reset = PasswordReset(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at,
    )

    db.add(password_reset)
    db.commit()
    db.refresh(password_reset)

    html_body = render_email_template(
        "password_reset.html",
        otp=otp,
        expiry_minutes=10,
    )

    send_email(
        recipient_email=user.email,
        subject="Password Reset OTP",
        body=(
            f"Your password reset OTP is: {otp}\n\n"
            "This OTP will expire in 10 minutes.\n\n"
            "If you did not request a password reset, "
            "you can safely ignore this email."
        ),
        html_body=html_body,
    )

    logger.info(
        f"📧 Password Reset OTP Sent | "
        f"User={user.email} | "
        f"Reset ID={password_reset.id}"
    )

    return {
        "message": (
            "If the email is registered, " "a password reset OTP has been sent."
        ),
    }


@router.post(
    "/verify-otp",
    status_code=status.HTTP_200_OK,
)
async def verify_otp(
    verify_otp_request: VerifyOTPRequest,
    db: db_dependency,
):
    """
    Verify the password reset OTP.
    """

    user = db.query(User).filter(User.email == verify_otp_request.email).first()

    if not user:
        logger.warning(
            f"⚠️ OTP Verification Failed | "
            f"Email={verify_otp_request.email} not found."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    password_reset = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.user_id == user.id,
            PasswordReset.used.is_(False),
        )
        .order_by(PasswordReset.created_at.desc())
        .first()
    )

    if not password_reset:
        logger.warning(
            f"⚠️ OTP Verification Failed | "
            f"User={user.email} | No active reset request."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    current_time = datetime.utcnow()

    if current_time > password_reset.expires_at:
        logger.warning(
            f"⚠️ OTP Verification Failed | " f"User={user.email} | OTP expired."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    if not bcrypt_context.verify(
        verify_otp_request.otp,
        password_reset.otp_hash,
    ):
        logger.warning(
            f"⚠️ OTP Verification Failed | " f"User={user.email} | Invalid OTP."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP.",
        )

    password_reset.verified = True

    db.commit()
    db.refresh(password_reset)

    logger.info(
        f"✅ Password Reset OTP Verified | "
        f"User={user.email} | "
        f"Reset ID={password_reset.id}"
    )

    return {
        "message": "OTP verified successfully.",
    }


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
)
async def reset_password(
    reset_password_request: ResetPasswordRequest,
    db: db_dependency,
):
    """
    Reset the user's password after successful OTP verification.
    """

    user = db.query(User).filter(User.email == reset_password_request.email).first()

    if not user:
        logger.warning(
            f"⚠️ Password Reset Failed | "
            f"Email={reset_password_request.email} not found."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset request.",
        )

    password_reset = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.user_id == user.id,
            PasswordReset.verified.is_(True),
            PasswordReset.used.is_(False),
        )
        .order_by(PasswordReset.created_at.desc())
        .first()
    )

    if not password_reset:
        logger.warning(
            f"⚠️ Password Reset Failed | "
            f"User={user.email} | "
            f"No verified reset request."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset request.",
        )

    # Check OTP expiry again.
    current_time = datetime.utcnow()

    if current_time > password_reset.expires_at:
        logger.warning(
            f"⚠️ Password Reset Failed | "
            f"User={user.email} | "
            f"Reset request expired."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset request has expired.",
        )

    # Update password.
    user.password = bcrypt_context.hash(reset_password_request.password)

    # Mark reset request as consumed.
    password_reset.used = True

    db.commit()
    db.refresh(user)

    logger.info(
        f"🔐 Password Reset Successfully | "
        f"User={user.email} | "
        f"Reset ID={password_reset.id}"
    )

    return {
        "message": "Password reset successfully.",
    }
