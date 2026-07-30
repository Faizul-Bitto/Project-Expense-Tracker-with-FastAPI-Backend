import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models.user import User

bcrypt_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

oauth2_bearer = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def authenticate_user(email: str, password: str, db: Session):
    """
    Authenticate a user using email and password.
    """

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not bcrypt_context.verify(password, user.password):
        return None

    return user


def create_access_token(email: str, user_id: int, role: str, expires_delta: timedelta):
    """
    Generate a JWT access token.
    """

    payload = {
        "sub": email,
        "id": user_id,
        "role": role,
    }

    expire = datetime.now(timezone.utc) + expires_delta
    payload.update({"exp": expire})

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def generate_otp() -> str:
    """
    Generate a secure 6-digit OTP.
    """

    return f"{secrets.randbelow(1_000_000):06d}"


def generate_temporary_password(length: int = 12) -> str:
    """
    Generate a secure temporary password.
    """

    characters = (
        "abcdefghijklmnopqrstuvwxyz"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "0123456789"
        "!@#$%^&*"
    )

    return "".join(secrets.choice(characters) for _ in range(length))
