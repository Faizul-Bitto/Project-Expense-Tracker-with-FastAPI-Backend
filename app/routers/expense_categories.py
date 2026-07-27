from fastapi import APIRouter, HTTPException
from starlette import status

from app.core.logger import logger
from app.dependencies.database import db_dependency
from app.models.expense_category import ExpenseCategory
from app.schemas.expense_category import CreateExpenseCategoryRequest

router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"],
)


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_expense_category(
    db: db_dependency, create_expense_category_request: CreateExpenseCategoryRequest
):
    """
    Create a new expense category.

    Checks if the category already exists before saving.
    """
    existing_expense_category = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.name == create_expense_category_request.name)
        .first()
    )

    if existing_expense_category:
        logger.warning(
            f"⚠️ Expense Category Creation Failed | Category={create_expense_category_request.name} already exists."
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Expense Category already exists.",
        )

    expense_category = ExpenseCategory(
        name=create_expense_category_request.name,
    )

    db.add(expense_category)
    db.commit()
    db.refresh(expense_category)

    logger.info(
        f"✅ Expense Category Created | Category={create_expense_category_request.name}"
    )

    return {
        "message": "Expense Category Created successfully.",
        "expense_category": {
            "id": expense_category.id,
            "name": expense_category.name,
        },
    }
