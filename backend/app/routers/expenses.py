from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from starlette import status

from app.core.logger import logger
from app.dependencies.database import db_dependency
from app.dependencies.user import user_dependency
from app.models.expense import Expense
from app.models.expense_category import ExpenseCategory
from app.models.expense_item import ExpenseItem
from app.schemas.expense import CreateExpenseRequest

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"],
)


@router.get("", status_code=status.HTTP_200_OK)
async def get_expenses(
    user: user_dependency,
    db: db_dependency,
):
    """
    Retrieve all expenses belonging to the authenticated user.

    Expenses are ordered by date from newest to oldest.
    """

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.date.desc())
        .all()
    )

    logger.info(
        f"📊 Expenses Retrieved | " f"User={user.email} | " f"Count={len(expenses)}"
    )

    return {
        "message": "Expenses retrieved successfully.",
        "expenses": [
            {
                "id": expense.id,
                "date": expense.date,
                "total_amount": expense.total_amount,
                "items": [
                    {
                        "id": item.id,
                        "expense_category_id": item.expense_category_id,
                        "description": item.description,
                        "amount": item.amount,
                    }
                    for item in (
                        db.query(ExpenseItem)
                        .filter(ExpenseItem.expense_id == expense.id)
                        .all()
                    )
                ],
            }
            for expense in expenses
        ],
    }


@router.get("/{expense_id}", status_code=status.HTTP_200_OK)
async def get_expense_by_id(
    expense_id: int,
    user: user_dependency,
    db: db_dependency,
):
    """
    Retrieve a specific expense belonging to the authenticated user.
    """

    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == user.id,
        )
        .first()
    )

    if not expense:
        logger.warning(
            f"⚠️ Expense Retrieval Failed | " f"ID={expense_id} | " f"User={user.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    expense_items = (
        db.query(ExpenseItem).filter(ExpenseItem.expense_id == expense.id).all()
    )

    logger.info(f"📄 Expense Retrieved | " f"ID={expense.id} | " f"User={user.email}")

    return {
        "message": "Expense retrieved successfully.",
        "expense": {
            "id": expense.id,
            "date": expense.date,
            "total_amount": expense.total_amount,
            "items": [
                {
                    "id": item.id,
                    "expense_category_id": item.expense_category_id,
                    "description": item.description,
                    "amount": item.amount,
                }
                for item in expense_items
            ],
        },
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_expense(
    user: user_dependency,
    db: db_dependency,
    create_expense_request: CreateExpenseRequest,
):
    """
    Create a new expense with multiple expense items.

    The expense belongs to the authenticated user.
    The total amount is calculated by the backend.
    """

    # Validate all expense categories first.
    category_ids = {item.expense_category_id for item in create_expense_request.items}

    categories = (
        db.query(ExpenseCategory).filter(ExpenseCategory.id.in_(category_ids)).all()
    )

    existing_category_ids = {category.id for category in categories}

    invalid_category_ids = category_ids - existing_category_ids

    if invalid_category_ids:
        logger.warning(
            f"⚠️ Expense Creation Failed | "
            f"User={user.email} | "
            f"Invalid Category IDs={sorted(invalid_category_ids)}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more expense categories not found.",
        )

    # Calculate total on the backend.
    total_amount = sum(item.amount for item in create_expense_request.items)

    try:
        # Create the main expense record.
        expense = Expense(
            user_id=user.id,
            date=create_expense_request.date,
            total_amount=total_amount,
        )

        db.add(expense)
        db.flush()

        # Create all expense items.
        expense_items = [
            ExpenseItem(
                expense_id=expense.id,
                expense_category_id=item.expense_category_id,
                description=item.description,
                amount=item.amount,
            )
            for item in create_expense_request.items
        ]

        db.add_all(expense_items)

        db.commit()
        db.refresh(expense)

    except SQLAlchemyError:
        db.rollback()

        logger.exception(
            f"❌ Expense Creation Failed | "
            f"User={user.email} | "
            f"Date={create_expense_request.date}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create expense.",
        )

    logger.info(
        f"✅ Expense Created | "
        f"ID={expense.id} | "
        f"User={user.email} | "
        f"Date={expense.date} | "
        f"Total={expense.total_amount}"
    )

    return {
        "message": "Expense created successfully.",
        "expense": {
            "id": expense.id,
            "date": expense.date,
            "total_amount": expense.total_amount,
            "items": [
                {
                    "expense_category_id": item.expense_category_id,
                    "description": item.description,
                    "amount": item.amount,
                }
                for item in expense_items
            ],
        },
    }


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_expense(
    expense_id: int,
    user: user_dependency,
    db: db_dependency,
):
    """
    Delete a specific expense belonging to the authenticated user.

    Expense items are deleted automatically because the
    ExpenseItem model uses ON DELETE CASCADE.
    """

    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == user.id,
        )
        .first()
    )

    if not expense:
        logger.warning(
            f"⚠️ Expense Deletion Failed | " f"ID={expense_id} | " f"User={user.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    db.delete(expense)
    db.commit()

    logger.info(
        f"🗑️ Expense Deleted | "
        f"ID={expense.id} | "
        f"Date={expense.date} | "
        f"Total={expense.total_amount} | "
        f"User={user.email}"
    )

    return {
        "message": "Expense deleted successfully.",
    }
