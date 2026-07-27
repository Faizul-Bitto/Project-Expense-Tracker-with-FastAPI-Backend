import os

from fastapi import HTTPException
from jose import JWTError, jwt
from starlette import status

from app.dependencies.auth import oauth2_bearer_token_dependency

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


async def get_current_user(token: oauth2_bearer_token_dependency):
    """
    Validate the JWT access token and return the authenticated user's information.

    Raises:
        HTTPException: If the access token is invalid or expired.
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        email = payload.get("sub")
        user_id = payload.get("id")
        role = payload.get("role")

        if email is None or user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token.",
            )

        return {
            "user_id": user_id,
            "email": email,
            "role": role,
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )
