from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class CertificateOut(BaseModel):
    id: UUID
    issuer_name: str
    issuer_logo_path: str | None
    holder_name: str
    holder_family: str
    national_id: str
    certificate_title: str
    certificate_image_path: str
    qr_image_path: str | None
    issue_date: date
    expiry_date: date | None
    signature: str
    status: str
    revoke_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CertificateListOut(BaseModel):
    items: list[CertificateOut]
    total: int
    page: int
    page_size: int


class CertificateCreateOut(BaseModel):
    certificate: CertificateOut
    qr_download_url: str


class RevokeRequest(BaseModel):
    reason: str | None = None


class VerifyOut(BaseModel):
    valid: bool
    status: str
    certificate: CertificateOut | None = None
    certificate_image_url: str | None = None
    issuer_logo_url: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
