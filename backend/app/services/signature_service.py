import hashlib
import hmac


def generate_signature(cert_data: dict, secret_key: str) -> str:
    message = "|".join([
        str(cert_data["id"]),
        cert_data["national_id"],
        cert_data["holder_name"],
        cert_data["holder_family"],
        cert_data["issuer_name"],
        str(cert_data["issue_date"]),
        cert_data["certificate_title"],
    ])
    return hmac.new(
        secret_key.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()


def verify_signature(cert_data: dict, signature: str, secret_key: str) -> bool:
    expected = generate_signature(cert_data, secret_key)
    return hmac.compare_digest(expected, signature)
