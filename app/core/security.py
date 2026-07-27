from datetime import datetime, timedelta, timezone
import os

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
