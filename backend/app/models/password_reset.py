from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    otp_hash = Column(String(255), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    verified = Column(Boolean, default=False, nullable=False)

    used = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )
