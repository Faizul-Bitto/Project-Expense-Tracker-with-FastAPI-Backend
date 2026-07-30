from fastapi import APIRouter, HTTPException, Path
from starlette import status

from app.core.email import render_email_template, send_email
from app.core.logger import logger
from app.core.security import (
    bcrypt_context,
    generate_temporary_password,
)
from app.dependencies.admin import admin_dependency
from app.dependencies.database import db_dependency
from app.models.expense_category import ExpenseCategory
from app.models.user import User
from app.schemas.admin import (
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
)
from app.schemas.expense_category import (
    CreateExpenseCategoryRequest,
    UpdateExpenseCategoryRequest,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# --------------------------
# Users
# --------------------------
@router.get("/users", status_code=status.HTTP_200_OK)
async def get_all_users(
    admin: admin_dependency,
    db: db_dependency,
):
    """
    Get all non-admin users.

    Only administrators are allowed to view users.
    Admin users are excluded from the response.
    """

    users = db.query(User).filter(User.role != "admin").all()

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


@router.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Get a specific user by ID.

    Only administrators are allowed to view user details.
    Password is never returned in the response.

    Raises:
        HTTPException: If the user does not exist.
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        logger.warning(
            f"⚠️ User Retrieval Failed | "
            f"ID={user_id} not found | "
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


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    admin: admin_dependency,
    db: db_dependency,
    create_user_request: AdminCreateUserRequest,
):
    """
    Create a new user.

    Only administrators are allowed to create users.

    Raises:
        HTTPException: If the email is already registered.
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
            "role": user.role,
        },
    }


@router.put("/users/{user_id}", status_code=status.HTTP_200_OK)
async def update_user(
    admin: admin_dependency,
    db: db_dependency,
    update_user_request: AdminUpdateUserRequest,
    user_id: int = Path(gt=0),
):
    """
    Update an existing user.

    Only administrators are allowed to update users.

    Raises:
        HTTPException:
            - If the user does not exist.
            - If the email is already registered by another user.
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        logger.warning(f"⚠️ User Update Failed | " f"ID={user_id} not found.")

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == update_user_request.email)
        .filter(User.id != user_id)
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
            "role": user.role,
        },
    }


@router.post("/users/{user_id}/reset-password", status_code=status.HTTP_200_OK)
async def reset_user_password(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Reset a user's password.

    A secure temporary password is generated, stored as a bcrypt hash,
    and sent to the user's registered email address.

    Only administrators are allowed to reset user passwords.

    Raises:
        HTTPException: If the user does not exist.
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        logger.warning(
            f"⚠️ User Password Reset Failed | "
            f"ID={user_id} not found | "
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
    }


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Delete an existing user.

    Only administrators are allowed to delete users.

    Raises:
        HTTPException:
            - If the user does not exist.
            - If the administrator attempts to delete their own account.
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        logger.warning(f"⚠️ User Deletion Failed | " f"ID={user_id} not found.")

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if admin.id == user.id:
        logger.warning(
            f"⚠️ User Deletion Failed | "
            f"Admin={admin.email} attempted to delete their own account."
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


# --------------------------
# Expense Categories
# --------------------------
@router.post("/expense-categories", status_code=status.HTTP_201_CREATED)
async def create_expense_category(
    admin: admin_dependency,
    db: db_dependency,
    create_expense_category_request: CreateExpenseCategoryRequest,
):
    """
    Create a new expense category.

    Only administrators are allowed to create expense categories.

    Raises:
        HTTPException: If the expense category already exists.
    """

    existing_expense_category = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.name == create_expense_category_request.name)
        .first()
    )

    if existing_expense_category:
        logger.warning(
            f"⚠️ Expense Category Creation Failed | "
            f"Name={create_expense_category_request.name} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Expense category already exists.",
        )

    expense_category = ExpenseCategory(
        name=create_expense_category_request.name,
    )

    db.add(expense_category)
    db.commit()
    db.refresh(expense_category)

    logger.info(
        f"✅ Expense Category Created | "
        f"ID={expense_category.id} | "
        f"Name={expense_category.name} | "
        f"Created By Admin={admin.email}"
    )

    return {
        "message": "Expense category created successfully.",
        "expense_category": {
            "id": expense_category.id,
            "name": expense_category.name,
        },
    }


@router.put("/expense-categories/{category_id}", status_code=status.HTTP_200_OK)
async def update_expense_category(
    admin: admin_dependency,
    db: db_dependency,
    update_expense_category_request: UpdateExpenseCategoryRequest,
    category_id: int = Path(gt=0),
):
    """
    Update an existing expense category.

    Only administrators are allowed to update expense categories.

    Raises:
        HTTPException: If the expense category does not exist or
        another category already uses the requested name.
    """

    expense_category = (
        db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    )

    if not expense_category:
        logger.warning(
            f"⚠️ Expense Category Update Failed | " f"ID={category_id} not found."
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense category not found.",
        )

    existing_expense_category = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.name == update_expense_category_request.name)
        .filter(ExpenseCategory.id != category_id)
        .first()
    )

    if existing_expense_category:
        logger.warning(
            f"⚠️ Expense Category Update Failed | "
            f"Name={update_expense_category_request.name} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Expense category already exists.",
        )

    expense_category.name = update_expense_category_request.name

    db.commit()
    db.refresh(expense_category)

    logger.info(
        f"✅ Expense Category Updated | "
        f"ID={expense_category.id} | "
        f"Name={expense_category.name} | "
        f"Updated By Admin={admin.email}"
    )

    return {
        "message": "Expense category updated successfully.",
        "expense_category": {
            "id": expense_category.id,
            "name": expense_category.name,
        },
    }


@router.delete("/expense-categories/{category_id}", status_code=status.HTTP_200_OK)
async def delete_expense_category(
    admin: admin_dependency,
    db: db_dependency,
    category_id: int = Path(gt=0),
):
    """
    Delete an existing expense category.

    Only administrators are allowed to delete expense categories.

    Raises:
        HTTPException: If the expense category does not exist.
    """

    expense_category = (
        db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    )

    if not expense_category:
        logger.warning(
            f"⚠️ Expense Category Deletion Failed | " f"ID={category_id} not found."
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense category not found.",
        )

    db.delete(expense_category)
    db.commit()

    logger.info(
        f"🗑️ Expense Category Deleted | "
        f"ID={expense_category.id} | "
        f"Name={expense_category.name} | "
        f"Deleted By Admin={admin.email}"
    )

    return {
        "message": "Expense category deleted successfully.",
    }
