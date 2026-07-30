from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Path
from sqlalchemy.exc import SQLAlchemyError
from starlette import status

from app.core.logger import logger
from app.dependencies.admin import admin_dependency
from app.dependencies.database import db_dependency
from app.models.expense import Expense
from app.models.expense_category import ExpenseCategory
from app.models.expense_item import ExpenseItem
from app.models.user import User
from app.schemas.expense import UpdateExpenseRequest

router = APIRouter(
    prefix="/admin/users/{user_id}/expenses",
    tags=["Admin - Expenses"],
)


@router.get("", status_code=status.HTTP_200_OK)
async def get_user_expenses(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
):
    """
    Retrieve all expenses belonging to a specific non-admin user.

    Expenses are sorted by date in descending order.
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
            f"⚠️ User Expenses Retrieval Failed | "
            f"User ID={user_id} not found or is an admin | "
            f"Requested By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    expenses = (
        db.query(Expense)
        .filter(
            Expense.user_id == user.id,
        )
        .order_by(
            Expense.date.desc(),
            Expense.id.desc(),
        )
        .all()
    )

    logger.info(
        f"📊 User Expenses Retrieved | "
        f"User ID={user.id} | "
        f"Email={user.email} | "
        f"Count={len(expenses)} | "
        f"Retrieved By Admin={admin.email}"
    )

    return {
        "message": "User expenses retrieved successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
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
                        .filter(
                            ExpenseItem.expense_id == expense.id,
                        )
                        .all()
                    )
                ],
            }
            for expense in expenses
        ],
    }


@router.get(
    "/{expense_id}",
    status_code=status.HTTP_200_OK,
)
async def get_user_expense(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
    expense_id: int = Path(gt=0),
):
    """
    Retrieve a specific expense belonging to
    a specific user.
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
            f"⚠️ User Expense Retrieval Failed | "
            f"User ID={user_id} not found or is an admin | "
            f"Requested By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

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
            f"⚠️ Specific Expense Retrieval Failed | "
            f"Expense ID={expense_id} | "
            f"User ID={user.id} | "
            f"Requested By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    items = (
        db.query(ExpenseItem)
        .filter(
            ExpenseItem.expense_id == expense.id,
        )
        .all()
    )

    logger.info(
        f"💰 Expense Retrieved | "
        f"Expense ID={expense.id} | "
        f"User ID={user.id} | "
        f"Email={user.email} | "
        f"Retrieved By Admin={admin.email}"
    )

    return {
        "message": "Expense retrieved successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
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
                for item in items
            ],
        },
    }


@router.put(
    "/{expense_id}",
    status_code=status.HTTP_200_OK,
)
async def update_user_expense(
    admin: admin_dependency,
    db: db_dependency,
    update_expense_request: UpdateExpenseRequest,
    user_id: int = Path(gt=0),
    expense_id: int = Path(gt=0),
):
    """
    Update a specific expense belonging to
    a specific user.

    The expense date and all expense items can
    be updated.

    The total amount is recalculated automatically.
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
            f"⚠️ Admin Expense Update Failed | "
            f"User ID={user_id} not found or is an admin | "
            f"Updated By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

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
            f"⚠️ Admin Expense Update Failed | "
            f"Expense ID={expense_id} not found for "
            f"User ID={user.id} | "
            f"Updated By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    # Validate expense categories
    category_ids = {item.expense_category_id for item in update_expense_request.items}

    existing_categories = (
        db.query(ExpenseCategory)
        .filter(
            ExpenseCategory.id.in_(category_ids),
        )
        .all()
    )

    existing_category_ids = {category.id for category in existing_categories}

    missing_category_ids = category_ids - existing_category_ids

    if missing_category_ids:
        logger.warning(
            f"⚠️ Admin Expense Update Failed | "
            f"Expense ID={expense.id} | "
            f"Invalid Category IDs={missing_category_ids} | "
            f"Updated By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more expense categories not found.",
        )

    try:
        # Calculate total amount
        total_amount = sum(
            (item.amount for item in update_expense_request.items),
            Decimal("0.00"),
        )

        # Update expense
        expense.date = update_expense_request.date
        expense.total_amount = total_amount

        # Delete old expense items
        db.query(ExpenseItem).filter(
            ExpenseItem.expense_id == expense.id,
        ).delete(
            synchronize_session=False,
        )

        # Create new expense items
        for item in update_expense_request.items:
            expense_item = ExpenseItem(
                expense_id=expense.id,
                expense_category_id=item.expense_category_id,
                description=item.description,
                amount=item.amount,
            )

            db.add(expense_item)

        # Commit everything together
        db.commit()
        db.refresh(expense)

    except SQLAlchemyError:
        db.rollback()

        logger.exception(
            f"❌ Admin Expense Update Failed | "
            f"Expense ID={expense_id} | "
            f"User ID={user_id} | "
            f"Updated By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update expense.",
        )

    logger.info(
        f"✅ Expense Updated By Admin | "
        f"Expense ID={expense.id} | "
        f"User ID={user.id} | "
        f"Email={user.email} | "
        f"Total={expense.total_amount} | "
        f"Updated By Admin={admin.email}"
    )

    updated_items = (
        db.query(ExpenseItem)
        .filter(
            ExpenseItem.expense_id == expense.id,
        )
        .all()
    )

    return {
        "message": "Expense updated successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
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
                for item in updated_items
            ],
        },
    }


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_user_expense(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
    expense_id: int = Path(gt=0),
):
    """
    Delete a specific expense belonging to
    a specific non-admin user.
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
            f"⚠️ User Expense Deletion Failed | "
            f"User ID={user_id} not found or is an admin | "
            f"Deleted By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

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
            f"⚠️ User Expense Deletion Failed | "
            f"Expense ID={expense_id} not found for "
            f"User ID={user.id} | "
            f"Deleted By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found.",
        )

    db.delete(expense)
    db.commit()

    logger.info(
        f"🗑️ User Expense Deleted | "
        f"Expense ID={expense.id} | "
        f"User ID={user.id} | "
        f"User Email={user.email} | "
        f"Deleted By Admin={admin.email}"
    )

    return {
        "message": "User expense deleted successfully.",
    }


@router.get(
    "/date/{expense_date}",
    status_code=status.HTTP_200_OK,
)
async def get_user_expenses_by_date(
    admin: admin_dependency,
    db: db_dependency,
    user_id: int = Path(gt=0),
    expense_date: date = Path(),
):
    """
    Get all expenses of a specific user
    for a specific date.
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
            f"⚠️ User Expense Filter Failed | "
            f"User ID={user_id} not found or is an admin | "
            f"Requested By Admin={admin.email}"
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    expenses = (
        db.query(Expense)
        .filter(
            Expense.user_id == user.id,
            Expense.date == expense_date,
        )
        .order_by(
            Expense.id.desc(),
        )
        .all()
    )

    logger.info(
        f"🔎 User Expenses Filtered | "
        f"User ID={user.id} | "
        f"Email={user.email} | "
        f"Date={expense_date} | "
        f"Count={len(expenses)} | "
        f"Filtered By Admin={admin.email}"
    )

    return {
        "message": "User expenses retrieved successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
        "date": expense_date,
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
                        .filter(
                            ExpenseItem.expense_id == expense.id,
                        )
                        .all()
                    )
                ],
            }
            for expense in expenses
        ],
    }
