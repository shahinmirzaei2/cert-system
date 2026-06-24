import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateOut, VerifyOut
from app.services.signature_service import verify_signature
from app.services.storage_service import get_file

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

    base = settings.BASE_URL
    certificate_image_url = f"{base}/api/verify/{cert_id}/image"
    issuer_logo_url = None
    if cert.issuer_logo_path:
        issuer_logo_url = f"{base}/api/verify/{cert_id}/logo"

    return VerifyOut(
        valid=True,
        status=cert.status,
        certificate=CertificateOut.model_validate(cert),
        certificate_image_url=certificate_image_url,
        issuer_logo_url=issuer_logo_url,
    )


@router.get("/{cert_id}/image")
async def get_certificate_image(
    cert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="گواهی یافت نشد")

    if cert.status == "revoked":
        raise HTTPException(status_code=403, detail="گواهی لغو شده است")

    cert_data = {
        "id": cert.id,
        "national_id": cert.national_id,
        "holder_name": cert.holder_name,
        "holder_family": cert.holder_family,
        "issuer_name": cert.issuer_name,
        "issue_date": cert.issue_date,
        "certificate_title": cert.certificate_title,
    }
    if not verify_signature(cert_data, cert.signature, settings.HMAC_SECRET):
        raise HTTPException(status_code=403, detail="امضای نامعتبر")

    data = get_file(cert.certificate_image_path)
    ext = cert.certificate_image_path.rsplit(".", 1)[-1].lower()
    media = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}.get(ext, "image/png")
    return Response(content=data, media_type=media)


@router.get("/{cert_id}/logo")
async def get_issuer_logo(
    cert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = result.scalar_one_or_none()
    if not cert or not cert.issuer_logo_path:
        raise HTTPException(status_code=404, detail="لوگو یافت نشد")

    data = get_file(cert.issuer_logo_path)
    ext = cert.issuer_logo_path.rsplit(".", 1)[-1].lower()
    media = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}.get(ext, "image/png")
    return Response(content=data, media_type=media)
