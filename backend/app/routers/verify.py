import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateOut, VerifyOut
from app.services.signature_service import verify_signature
from app.services.storage_service import get_presigned_url

router = APIRouter(prefix="/api/verify", tags=["verify"])


@router.get("/{cert_id}", response_model=VerifyOut)
async def verify_certificate(
    cert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = result.scalar_one_or_none()

    if not cert:
        raise HTTPException(status_code=404, detail="گواهی یافت نشد")

    cert_data = {
        "id": cert.id,
        "national_id": cert.national_id,
        "holder_name": cert.holder_name,
        "holder_family": cert.holder_family,
        "issuer_name": cert.issuer_name,
        "issue_date": cert.issue_date,
        "certificate_title": cert.certificate_title,
    }

    is_valid = verify_signature(cert_data, cert.signature, settings.HMAC_SECRET)

    if not is_valid:
        return VerifyOut(
            valid=False,
            status="tampered",
            certificate=None,
            certificate_image_url=None,
        )

    if cert.status == "revoked":
        return VerifyOut(
            valid=False,
            status="revoked",
            certificate=CertificateOut.model_validate(cert),
            certificate_image_url=None,
        )

    certificate_image_url = get_presigned_url(cert.certificate_image_path)
    issuer_logo_url = None
    if cert.issuer_logo_path:
        issuer_logo_url = get_presigned_url(cert.issuer_logo_path)

    return VerifyOut(
        valid=True,
        status=cert.status,
        certificate=CertificateOut.model_validate(cert),
        certificate_image_url=certificate_image_url,
        issuer_logo_url=issuer_logo_url,
    )
