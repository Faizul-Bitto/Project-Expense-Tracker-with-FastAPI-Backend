from fastapi import APIRouter
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
