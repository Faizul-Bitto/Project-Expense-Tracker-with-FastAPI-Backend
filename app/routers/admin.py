from fastapi import APIRouter, HTTPException, Path
from starlette import status

from app.core.logger import logger
from app.dependencies.admin import admin_dependency
from app.dependencies.database import db_dependency
from app.models.expense_category import ExpenseCategory
from app.schemas.expense_category import (
    CreateExpenseCategoryRequest,
    UpdateExpenseCategoryRequest,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


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
        f"Admin={admin.email}"
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
        f"Admin={admin.email}"
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
        f"Admin={admin.email}"
    )

    return {
        "message": "Expense category deleted successfully.",
    }
