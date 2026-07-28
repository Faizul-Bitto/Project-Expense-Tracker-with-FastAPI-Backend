from fastapi import APIRouter, HTTPException, Path
from starlette import status

from app.core.logger import logger
from app.dependencies.database import db_dependency
from app.dependencies.user import user_dependency
from app.models.expense_category import ExpenseCategory

router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"],
)


@router.get("", status_code=status.HTTP_200_OK)
async def get_expense_categories(user: user_dependency, db: db_dependency):
    """
    Retrieve all available expense categories.
    """

    expense_categories = db.query(ExpenseCategory).all()

    logger.info(
        f"📂 Expense Categories Retrieved | "
        f"User={user.email} | "
        f"Count={len(expense_categories)}"
    )

    return {
        "message": "Expense categories retrieved successfully.",
        "expense_categories": [
            {
                "id": category.id,
                "name": category.name,
            }
            for category in expense_categories
        ],
    }


@router.get("/{category_id}", status_code=status.HTTP_200_OK)
async def get_expense_category_by_id(
    user: user_dependency, db: db_dependency, category_id: int = Path(gt=0)
):
    """
    Retrieve an expense category by its ID.
    """

    expense_category = (
        db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    )

    if not expense_category:
        logger.warning(
            f"⚠️ Expense Category Retrieval Failed | ID={category_id} not found."
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense category not found.",
        )

    logger.info(
        f"📂 Expense Category Retrieved | "
        f"ID={expense_category.id} | "
        f"User={user.email}"
    )

    return {
        "message": "Expense category retrieved successfully.",
        "expense_category": {
            "id": expense_category.id,
            "name": expense_category.name,
        },
    }
