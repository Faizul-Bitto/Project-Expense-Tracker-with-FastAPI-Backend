from fastapi import APIRouter, HTTPException
from starlette import status

from app.core.logger import logger
from app.dependencies.authorization import admin_dependency
from app.dependencies.database import db_dependency
from app.models.expense_category import ExpenseCategory
from app.schemas.expense_category import CreateExpenseCategoryRequest

router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"],
)


@router.post("/create", status_code=status.HTTP_201_CREATED)
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
            f"⚠️ Expense Category Creation Failed | Name={create_expense_category_request.name} already exists."
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
        f"Created By Admin={admin['email']}"
    )

    return {
        "message": "Expense category created successfully.",
        "data": {
            "id": expense_category.id,
            "name": expense_category.name,
        },
    }
