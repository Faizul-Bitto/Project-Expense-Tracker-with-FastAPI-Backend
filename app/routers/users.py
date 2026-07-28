from fastapi import APIRouter, HTTPException
from starlette import status

from app.core.logger import logger
from app.core.security import bcrypt_context
from app.dependencies.database import db_dependency
from app.dependencies.user import user_dependency
from app.models.user import User
from app.schemas.user import UpdateUserRequest, UserUpdatePasswordRequest

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me", status_code=status.HTTP_200_OK)
async def get_profile(user: user_dependency):
    """
    Retrieve the authenticated user's profile.
    """

    logger.info(
        f"👤 Profile Retrieved | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "message": "User profile retrieved successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.put("/me", status_code=status.HTTP_200_OK)
async def update_profile(
    user: user_dependency,
    db: db_dependency,
    update_request: UpdateUserRequest,
):
    """
    Update the authenticated user's profile.
    """

    existing_email = (
        db.query(User)
        .filter(User.email == update_request.email)
        .filter(User.id != user.id)
        .first()
    )

    if existing_email:
        logger.warning(
            f"⚠️ Profile Update Failed | Email={update_request.email} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user.name = update_request.name
    user.email = update_request.email

    db.commit()
    db.refresh(user)

    logger.info(
        f"✅ Profile Updated | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "message": "Profile updated successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.put("/me/password", status_code=status.HTTP_200_OK)
async def update_password(
    user: user_dependency,
    db: db_dependency,
    update_password_request: UserUpdatePasswordRequest,
):
    """
    Update the authenticated user's password.
    """

    if not bcrypt_context.verify(
        update_password_request.password,
        user.password,
    ):
        logger.warning(
            f"⚠️ Password Update Failed | Incorrect Password | Email={user.email} | Role={user.role}"
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    user.password = bcrypt_context.hash(
        update_password_request.new_password,
    )

    db.commit()
    db.refresh(user)

    logger.info(
        f"🔐 Password Updated | ID={user.id} | Email={user.email} | Role={user.role}"
    )

    return {
        "message": "Password updated successfully.",
    }
