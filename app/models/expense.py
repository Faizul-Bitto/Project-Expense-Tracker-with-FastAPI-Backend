from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.sql import func

from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    date = Column(Date, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
