import uuid
from datetime import date, datetime

from sqlalchemy import String, Text, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    issuer_name: Mapped[str] = mapped_column(String(255))
    issuer_logo_path: Mapped[str | None] = mapped_column(String(500))
    holder_name: Mapped[str] = mapped_column(String(255))
    holder_family: Mapped[str] = mapped_column(String(255))
    national_id: Mapped[str] = mapped_column(String(20))
    certificate_title: Mapped[str] = mapped_column(String(500))
    certificate_image_path: Mapped[str] = mapped_column(String(500))
    qr_image_path: Mapped[str | None] = mapped_column(String(500))
    issue_date: Mapped[date] = mapped_column(Date)
    expiry_date: Mapped[date | None] = mapped_column(Date)
    signature: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(20), default="active")
    revoke_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
