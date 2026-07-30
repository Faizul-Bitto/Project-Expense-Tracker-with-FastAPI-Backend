from fastapi import APIRouter, HTTPException, Path, Query
from starlette import status

from app.core.email import render_email_template, send_email
from app.core.logger import logger
from app.core.security import (
    bcrypt_context,
    generate_temporary_password,
)
from app.dependencies.admin import admin_dependency
from app.dependencies.database import db_dependency
from app.models.user import User
from app.schemas.admin import (
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
)

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin - Users"],
)


@router.get("", status_code=status.HTTP_200_OK)
async def get_all_users(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get all non-admin users.

    Only administrators are allowed to view users.
    Admin users are excluded from the response.
    """

    users = db.query(User).filter(User.role != "admin").order_by(User.id.desc()).all()

    logger.info(
        f"👥 Users Retrieved | "
        f"Count={len(users)} | "
        f"Retrieved By Admin={admin.email}"
    )

    return {
        "message": "Users retrieved successfully.",
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "password": user.password,
                "role": user.role,
            }
            for user in users
        ],
    }


@router.get("/search", status_code=status.HTTP_200_OK)
async def search_users(
    admin: admin_dependency,
    db: db_dependency,
    query: str = Query(
        min_length=1,
        description="Search users by name or email.",
    ),
):
    """
    Search non-admin users by name or email.

    The search is case-insensitive and supports
    partial name or email matching.
    """

    search_query = query.strip()

    if not search_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty.",
        )

    users = (
        db.query(User)
        .filter(
            User.role != "admin",
            (
                User.name.ilike(f"%{search_query}%")
                | User.email.ilike(f"%{search_query}%")
            ),
        )
        .order_by(User.id.desc())
        .all()
    )

    logger.info(
        f"🔎 Users Searched | "
        f"Query={search_query} | "
        f"Count={len(users)} | "
        f"Searched By Admin={admin.email}"
    )

    return {
        "message": "Users search completed successfully.",
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "password": user.password,
                "role": user.role,
            }
            for user in users
        ],
    }


@router.get("/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Get a specific non-admin user by ID.

    Only administrators are allowed to view user details.
    """

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role != "admin",
        )
        .first()
    )

    if not user:
        logger.warning(
            f"⚠️ User Retrieval Failed | "
            f"ID={user_id} not found or is an admin | "
            f"Requested By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    logger.info(
        f"👤 User Retrieved | "
        f"ID={user.id} | "
        f"Email={user.email} | "
        f"Retrieved By Admin={admin.email}"
    )

    return {
        "message": "User retrieved successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password": user.password,
            "role": user.role,
        },
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(
    admin: admin_dependency,
    db: db_dependency,
    create_user_request: AdminCreateUserRequest,
):
    """
    Create a new user.

    Only administrators are allowed to create users.
    """

    existing_user = (
        db.query(User).filter(User.email == create_user_request.email).first()
    )

    if existing_user:
        logger.warning(
            f"⚠️ User Creation Failed | "
            f"Email={create_user_request.email} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user = User(
        name=create_user_request.name,
        email=create_user_request.email,
        password=bcrypt_context.hash(create_user_request.password),
        role=create_user_request.role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(
        f"✅ User Created | "
        f"ID={user.id} | "
        f"Email={user.email} | "
        f"Role={user.role} | "
        f"Created By Admin={admin.email}"
    )

    return {
        "message": "User created successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password": user.password,
            "role": user.role,
        },
    }


@router.put("/{user_id}", status_code=status.HTTP_200_OK)
async def update_user(
    admin: admin_dependency,
    db: db_dependency,
    update_user_request: AdminUpdateUserRequest,
    user_id: int = Path(gt=0),
):
    """
    Update an existing user.

    Only administrators are allowed to update users.
    """

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role != "admin",
        )
        .first()
    )

    if not user:
        logger.warning(
            f"⚠️ User Update Failed | " f"ID={user_id} not found or is an admin."
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    existing_user = (
        db.query(User)
        .filter(
            User.email == update_user_request.email,
            User.id != user_id,
        )
        .first()
    )

    if existing_user:
        logger.warning(
            f"⚠️ User Update Failed | "
            f"Email={update_user_request.email} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    user.name = update_user_request.name
    user.email = update_user_request.email
    user.password = bcrypt_context.hash(update_user_request.password)
    user.role = update_user_request.role

    db.commit()
    db.refresh(user)

    logger.info(
        f"✅ User Updated | "
        f"ID={user.id} | "
        f"Email={user.email} | "
        f"Role={user.role} | "
        f"Updated By Admin={admin.email}"
    )

    return {
        "message": "User updated successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password": user.password,
            "role": user.role,
        },
    }


@router.post("/{user_id}/reset-password", status_code=status.HTTP_200_OK)
async def reset_user_password(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Reset a user's password.

    A secure temporary password is generated,
    stored as a bcrypt hash, and sent to the
    user's registered email address.
    """

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role != "admin",
        )
        .first()
    )

    if not user:
        logger.warning(
            f"⚠️ User Password Reset Failed | "
            f"ID={user_id} not found or is an admin | "
            f"Requested By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    temporary_password = generate_temporary_password()

    user.password = bcrypt_context.hash(temporary_password)

    db.commit()
    db.refresh(user)

    html_body = render_email_template(
        "admin_password_reset.html",
        temporary_password=temporary_password,
    )

    send_email(
        recipient_email=user.email,
        subject="Your Password Has Been Reset",
        body=(
            "Your password has been reset by an administrator.\n\n"
            f"Temporary password: {temporary_password}\n\n"
            "You can change your password later from your account settings."
        ),
        html_body=html_body,
    )

    logger.info(
        f"🔐 User Password Reset | "
        f"ID={user.id} | "
        f"Email={user.email} | "
        f"Role={user.role} | "
        f"Reset By Admin={admin.email}"
    )

    return {
        "message": "User password reset successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password": user.password,
            "role": user.role,
        },
    }


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Delete an existing user.

    Administrators cannot delete their own account.
    """

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role != "admin",
        )
        .first()
    )

    if not user:
        logger.warning(
            f"⚠️ User Deletion Failed | " f"ID={user_id} not found or is an admin."
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if admin.id == user.id:
        logger.warning(
            f"⚠️ User Deletion Failed | "
            f"Admin={admin.email} attempted to delete "
            f"their own account."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    db.delete(user)
    db.commit()

    logger.info(
        f"🗑️ User Deleted | "
        f"ID={user.id} | "
        f"Email={user.email} | "
        f"Role={user.role} | "
        f"Deleted By Admin={admin.email}"
    )

    return {
        "message": "User deleted successfully.",
    }
