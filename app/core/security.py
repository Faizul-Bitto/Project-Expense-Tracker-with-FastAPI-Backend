from datetime import datetime, timedelta, timezone
import os

from typing import Annotated
from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status

from app.models.user import User

bcrypt_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

oauth2_bearer = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)

oauth2_bearer_token_dependency = Annotated[str, Depends(oauth2_bearer)]

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


async def get_current_user(token: oauth2_bearer_token_dependency):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user_id = payload.get("id")
        role = payload.get("role")

        if email is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
            )

        return {"user_id": user_id, "email": email, "role": role}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
