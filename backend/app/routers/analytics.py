from calendar import monthrange
from datetime import date, timedelta

from fastapi import APIRouter
from sqlalchemy import func
from starlette import status

from app.core.logger import logger
from app.dependencies.database import db_dependency
from app.dependencies.user import user_dependency
from app.models.expense import Expense
from app.models.expense_category import ExpenseCategory
from app.models.expense_item import ExpenseItem

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# --------------------------------------------------
# Helper Functions
# --------------------------------------------------
def get_week_start(target_date: date) -> date:
    """
    Return Monday of the week containing target_date.
    """

    return target_date - timedelta(days=target_date.weekday())


def get_month_start(target_date: date) -> date:
    """
    Return the first day of the month.
    """

    return target_date.replace(day=1)


def get_year_start(target_date: date) -> date:
    """
    Return the first day of the year.
    """

    return target_date.replace(month=1, day=1)


def get_next_month(target_date: date) -> date:
    """
    Return the first day of the next month.
    """

    if target_date.month == 12:
        return date(target_date.year + 1, 1, 1)

    return date(target_date.year, target_date.month + 1, 1)


# --------------------------------------------------
# Analytics Summary
# --------------------------------------------------
@router.get("/summary", status_code=status.HTTP_200_OK)
async def get_analytics_summary(
    user: user_dependency,
    db: db_dependency,
):
    """
    Get expense summary for the authenticated user.

    Includes:
        - Total expense
        - Today's expense
        - This week's expense
        - This month's expense
        - This year's expense
        - Total expense count
        - Average expense
        - Highest expense
    """

    today = date.today()

    week_start = get_week_start(today)
    next_week_start = week_start + timedelta(days=7)

    month_start = get_month_start(today)
    next_month_start = get_next_month(today)

    year_start = get_year_start(today)
    next_year_start = date(today.year + 1, 1, 1)

    total_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(Expense.user_id == user.id)
        .scalar()
    )

    today_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.user_id == user.id,
            Expense.date == today,
        )
        .scalar()
    )

    weekly_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.user_id == user.id,
            Expense.date >= week_start,
            Expense.date < next_week_start,
        )
        .scalar()
    )

    monthly_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.user_id == user.id,
            Expense.date >= month_start,
            Expense.date < next_month_start,
        )
        .scalar()
    )

    yearly_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.user_id == user.id,
            Expense.date >= year_start,
            Expense.date < next_year_start,
        )
        .scalar()
    )

    total_expense_count = (
        db.query(func.count(Expense.id)).filter(Expense.user_id == user.id).scalar()
    )

    average_expense = (
        db.query(func.coalesce(func.avg(Expense.total_amount), 0))
        .filter(Expense.user_id == user.id)
        .scalar()
    )

    highest_expense = (
        db.query(func.coalesce(func.max(Expense.total_amount), 0))
        .filter(Expense.user_id == user.id)
        .scalar()
    )

    logger.info(f"📊 Analytics Summary Retrieved | " f"User={user.email}")

    return {
        "message": "Analytics summary retrieved successfully.",
        "summary": {
            "total_expense": total_expense,
            "today_expense": today_expense,
            "weekly_expense": weekly_expense,
            "monthly_expense": monthly_expense,
            "yearly_expense": yearly_expense,
            "total_expense_count": total_expense_count,
            "average_expense": average_expense,
            "highest_expense": highest_expense,
        },
    }


# --------------------------------------------------
# Weekly Analytics
# --------------------------------------------------
@router.get("/weekly", status_code=status.HTTP_200_OK)
async def get_weekly_analytics(
    user: user_dependency,
    db: db_dependency,
):
    """
    Get daily expense breakdown for the current week.

    Week starts on Monday and ends on Sunday.
    """

    today = date.today()
    week_start = get_week_start(today)

    weekly_data = []

    for day_offset in range(7):
        current_day = week_start + timedelta(days=day_offset)

        total = (
            db.query(func.coalesce(func.sum(Expense.total_amount), 0))
            .filter(
                Expense.user_id == user.id,
                Expense.date == current_day,
            )
            .scalar()
        )

        count = (
            db.query(func.count(Expense.id))
            .filter(
                Expense.user_id == user.id,
                Expense.date == current_day,
            )
            .scalar()
        )

        weekly_data.append(
            {
                "date": current_day,
                "day": current_day.strftime("%A"),
                "total_expense": total,
                "expense_count": count,
            }
        )

    total_weekly_expense = sum(item["total_expense"] for item in weekly_data)

    logger.info(f"📈 Weekly Analytics Retrieved | " f"User={user.email}")

    return {
        "message": "Weekly analytics retrieved successfully.",
        "week_start": week_start,
        "week_end": week_start + timedelta(days=6),
        "total_expense": total_weekly_expense,
        "daily_breakdown": weekly_data,
    }


# --------------------------------------------------
# Monthly Analytics
# --------------------------------------------------
@router.get("/monthly", status_code=status.HTTP_200_OK)
async def get_monthly_analytics(
    user: user_dependency,
    db: db_dependency,
):
    """
    Get daily expense breakdown for the current month.
    """

    today = date.today()

    month_start = get_month_start(today)
    next_month_start = get_next_month(today)

    days_in_month = monthrange(
        today.year,
        today.month,
    )[1]

    monthly_data = []

    for day_number in range(1, days_in_month + 1):
        current_day = date(
            today.year,
            today.month,
            day_number,
        )

        total = (
            db.query(func.coalesce(func.sum(Expense.total_amount), 0))
            .filter(
                Expense.user_id == user.id,
                Expense.date == current_day,
            )
            .scalar()
        )

        count = (
            db.query(func.count(Expense.id))
            .filter(
                Expense.user_id == user.id,
                Expense.date == current_day,
            )
            .scalar()
        )

        monthly_data.append(
            {
                "date": current_day,
                "day": day_number,
                "total_expense": total,
                "expense_count": count,
            }
        )

    total_monthly_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.user_id == user.id,
            Expense.date >= month_start,
            Expense.date < next_month_start,
        )
        .scalar()
    )

    logger.info(f"📅 Monthly Analytics Retrieved | " f"User={user.email}")

    return {
        "message": "Monthly analytics retrieved successfully.",
        "month": today.strftime("%B"),
        "year": today.year,
        "month_start": month_start,
        "month_end": next_month_start - timedelta(days=1),
        "total_expense": total_monthly_expense,
        "daily_breakdown": monthly_data,
    }


# --------------------------------------------------
# Yearly Analytics
# --------------------------------------------------
@router.get("/yearly", status_code=status.HTTP_200_OK)
async def get_yearly_analytics(
    user: user_dependency,
    db: db_dependency,
):
    """
    Get monthly expense breakdown for the current year.
    """

    today = date.today()

    year_start = get_year_start(today)
    next_year_start = date(today.year + 1, 1, 1)

    yearly_data = []

    for month_number in range(1, 13):
        current_month_start = date(
            today.year,
            month_number,
            1,
        )

        if month_number == 12:
            current_month_end = date(
                today.year + 1,
                1,
                1,
            )
        else:
            current_month_end = date(
                today.year,
                month_number + 1,
                1,
            )

        total = (
            db.query(func.coalesce(func.sum(Expense.total_amount), 0))
            .filter(
                Expense.user_id == user.id,
                Expense.date >= current_month_start,
                Expense.date < current_month_end,
            )
            .scalar()
        )

        count = (
            db.query(func.count(Expense.id))
            .filter(
                Expense.user_id == user.id,
                Expense.date >= current_month_start,
                Expense.date < current_month_end,
            )
            .scalar()
        )

        yearly_data.append(
            {
                "month": month_number,
                "month_name": current_month_start.strftime("%B"),
                "total_expense": total,
                "expense_count": count,
            }
        )

    total_yearly_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.user_id == user.id,
            Expense.date >= year_start,
            Expense.date < next_year_start,
        )
        .scalar()
    )

    logger.info(f"📊 Yearly Analytics Retrieved | " f"User={user.email}")

    return {
        "message": "Yearly analytics retrieved successfully.",
        "year": today.year,
        "total_expense": total_yearly_expense,
        "monthly_breakdown": yearly_data,
    }


# --------------------------------------------------
# Category Analytics
# --------------------------------------------------
@router.get("/categories", status_code=status.HTTP_200_OK)
async def get_category_analytics(
    user: user_dependency,
    db: db_dependency,
):
    """
    Get expense breakdown by category
    for the authenticated user.
    """

    category_data = (
        db.query(
            ExpenseCategory.id,
            ExpenseCategory.name,
            func.coalesce(func.sum(ExpenseItem.amount), 0).label("total_amount"),
            func.count(ExpenseItem.id).label("item_count"),
        )
        .join(
            ExpenseItem,
            ExpenseItem.expense_category_id == ExpenseCategory.id,
        )
        .join(
            Expense,
            Expense.id == ExpenseItem.expense_id,
        )
        .filter(
            Expense.user_id == user.id,
        )
        .group_by(
            ExpenseCategory.id,
            ExpenseCategory.name,
        )
        .order_by(func.sum(ExpenseItem.amount).desc())
        .all()
    )

    total_expense = sum(item.total_amount for item in category_data)

    categories = []

    for item in category_data:
        percentage = 0

        if total_expense:
            percentage = round(
                float(item.total_amount / total_expense) * 100,
                2,
            )

        categories.append(
            {
                "category_id": item.id,
                "category_name": item.name,
                "total_amount": item.total_amount,
                "expense_count": item.item_count,
                "percentage": percentage,
            }
        )

    logger.info(f"🥧 Category Analytics Retrieved | " f"User={user.email}")

    return {
        "message": "Category analytics retrieved successfully.",
        "total_expense": total_expense,
        "categories": categories,
    }


# --------------------------------------------------
# Expense Trend
# --------------------------------------------------
@router.get("/trends", status_code=status.HTTP_200_OK)
async def get_expense_trends(
    user: user_dependency,
    db: db_dependency,
):
    """
    Get the user's expense trend for the last 30 days.
    """

    today = date.today()
    start_date = today - timedelta(days=29)

    trend_data = []

    for day_offset in range(30):
        current_day = start_date + timedelta(days=day_offset)

        total = (
            db.query(func.coalesce(func.sum(Expense.total_amount), 0))
            .filter(
                Expense.user_id == user.id,
                Expense.date == current_day,
            )
            .scalar()
        )

        trend_data.append(
            {
                "date": current_day,
                "total_expense": total,
            }
        )

    logger.info(f"📈 Expense Trend Retrieved | " f"User={user.email}")

    return {
        "message": "Expense trend retrieved successfully.",
        "start_date": start_date,
        "end_date": today,
        "trend": trend_data,
    }
