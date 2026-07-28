import os
from typing import Annotated

from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from starlette import status

from app.dependencies.auth import oauth2_bearer_token_dependency
from app.dependencies.database import db_dependency
from app.models.user import User

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not SECRET_KEY or not ALGORITHM:
    raise RuntimeError("SECRET_KEY and ALGORITHM must be configured.")


async def get_current_user(
    token: oauth2_bearer_token_dependency, db: db_dependency
) -> User:
    """
    Validate the JWT access token and return the authenticated user.

    Raises:
        HTTPException: If the access token is invalid, expired,
        or the user no longer exists.
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token.",
            )

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )


user_dependency = Annotated[
    User,
    Depends(get_current_user),
]
