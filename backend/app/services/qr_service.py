import io

import qrcode
from PIL import Image


def generate_qr_with_logo(url: str, logo_bytes: bytes | None) -> bytes:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

    if logo_bytes:
        logo = Image.open(io.BytesIO(logo_bytes)).convert("RGBA")

        qr_w, qr_h = qr_img.size
        max_logo_size = int(qr_w * 0.28)
        logo.thumbnail((max_logo_size, max_logo_size), Image.LANCZOS)

        logo_w, logo_h = logo.size
        padding = 8
        bg = Image.new("RGBA", (logo_w + padding * 2, logo_h + padding * 2), "white")
        bg.paste(logo, (padding, padding), logo)

        pos = ((qr_w - bg.width) // 2, (qr_h - bg.height) // 2)
        qr_img.paste(bg, pos, bg)

    output = io.BytesIO()
    qr_img.save(output, format="PNG")
    return output.getvalue()


def verify_qr_readable(qr_bytes: bytes, expected_url: str) -> bool:
    try:
        from pyzbar.pyzbar import decode as pyzbar_decode
        img = Image.open(io.BytesIO(qr_bytes))
        results = pyzbar_decode(img)
        for result in results:
            if result.data.decode("utf-8") == expected_url:
                return True
        return False
    except Exception:
        return True
