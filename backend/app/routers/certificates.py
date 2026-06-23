import uuid
from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.certificate import Certificate
from app.models.user import User
from app.schemas.certificate import (
    CertificateCreateOut,
    CertificateListOut,
    CertificateOut,
    RevokeRequest,
)
from app.services.qr_service import generate_qr_with_logo, verify_qr_readable
from app.services.signature_service import generate_signature
from app.services.storage_service import get_file, upload_file
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/certificates", tags=["certificates"])


@router.post("", response_model=CertificateCreateOut, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    issuer_name: str = Form(...),
    holder_name: str = Form(...),
    holder_family: str = Form(...),
    national_id: str = Form(...),
    certificate_title: str = Form(...),
    issue_date: date = Form(...),
    expiry_date: date | None = Form(None),
    certificate_image: UploadFile = File(...),
    issuer_logo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cert_id = uuid.uuid4()

    cert_image_bytes = await certificate_image.read()
    cert_ext = certificate_image.filename.rsplit(".", 1)[-1] if certificate_image.filename else "png"
    cert_object_name = f"images/{cert_id}.{cert_ext}"
    upload_file(cert_object_name, cert_image_bytes, certificate_image.content_type or "image/png")

    logo_object_name = None
    logo_bytes = None
    if issuer_logo and issuer_logo.filename:
        logo_bytes = await issuer_logo.read()
        logo_ext = issuer_logo.filename.rsplit(".", 1)[-1] if issuer_logo.filename else "png"
        logo_object_name = f"logos/{cert_id}.{logo_ext}"
        upload_file(logo_object_name, logo_bytes, issuer_logo.content_type or "image/png")

    cert_data = {
        "id": cert_id,
        "national_id": national_id,
        "holder_name": holder_name,
        "holder_family": holder_family,
        "issuer_name": issuer_name,
        "issue_date": issue_date,
        "certificate_title": certificate_title,
    }
    signature = generate_signature(cert_data, settings.HMAC_SECRET)

    verify_url = f"{settings.FRONTEND_URL}/verify/{cert_id}"
    qr_bytes = generate_qr_with_logo(verify_url, logo_bytes)

    if not verify_qr_readable(qr_bytes, verify_url):
        qr_bytes = generate_qr_with_logo(verify_url, None)

    qr_object_name = f"qrcodes/{cert_id}.png"
    upload_file(qr_object_name, qr_bytes, "image/png")

    cert = Certificate(
        id=cert_id,
        issuer_name=issuer_name,
        issuer_logo_path=logo_object_name,
        holder_name=holder_name,
        holder_family=holder_family,
        national_id=national_id,
        certificate_title=certificate_title,
        certificate_image_path=cert_object_name,
        qr_image_path=qr_object_name,
        issue_date=issue_date,
        expiry_date=expiry_date,
        signature=signature,
        status="active",
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)

    return CertificateCreateOut(
        certificate=CertificateOut.model_validate(cert),
        qr_download_url=f"{settings.BASE_URL}/api/certificates/{cert_id}/qr",
    )


@router.get("", response_model=CertificateListOut)
async def list_certificates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Certificate).order_by(Certificate.created_at.desc())
    count_query = select(func.count()).select_from(Certificate)

    if search:
        filter_cond = or_(
            Certificate.holder_name.ilike(f"%{search}%"),
            Certificate.holder_family.ilike(f"%{search}%"),
            Certificate.national_id.ilike(f"%{search}%"),
        )
        query = query.where(filter_cond)
        count_query = count_query.where(filter_cond)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    items = result.scalars().all()

    return CertificateListOut(
        items=[CertificateOut.model_validate(c) for c in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{cert_id}", response_model=CertificateOut)
async def get_certificate(
    cert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="گواهی یافت نشد")
    return CertificateOut.model_validate(cert)


@router.patch("/{cert_id}/revoke", response_model=CertificateOut)
async def revoke_certificate(
    cert_id: uuid.UUID,
    body: RevokeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=404, detail="گواهی یافت نشد")

    if cert.status == "revoked":
        raise HTTPException(status_code=400, detail="گواهی قبلاً لغو شده است")

    cert.status = "revoked"
    cert.revoke_reason = body.reason
    await db.commit()
    await db.refresh(cert)
    return CertificateOut.model_validate(cert)


@router.get("/{cert_id}/qr")
async def download_qr(
    cert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Certificate).where(Certificate.id == cert_id))
    cert = result.scalar_one_or_none()
    if not cert or not cert.qr_image_path:
        raise HTTPException(status_code=404, detail="QRCode یافت نشد")

    qr_bytes = get_file(cert.qr_image_path)
    return Response(
        content=qr_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=qr-{cert_id}.png"},
    )
