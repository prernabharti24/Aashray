import hashlib
import secrets
import hmac
import time
import json
import base64
from typing import Optional, Dict, Any

SECRET_KEY = secrets.token_hex(32)

def hash_password(password: str) -> str:
    """
    Secure password hashing using PBKDF2-HMAC-SHA256 with 16-byte random salt.
    Format: pbkdf2:sha256:<salt>:<hash>
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"pbkdf2:sha256:{salt}:{key.hex()}"

def verify_password(stored_password: Optional[str], provided_password: str) -> bool:
    """
    Verifies a plaintext password against the stored PBKDF2-HMAC-SHA256 hash.
    Safe against timing attacks via secrets.compare_digest.
    """
    if not stored_password:
        return False

    parts = stored_password.split(":")
    if len(parts) == 4 and parts[0] == "pbkdf2" and parts[1] == "sha256":
        salt = parts[2]
        expected_hex = parts[3]
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(expected_hex, new_key.hex())

    # Fallback for simple salt:key format
    if len(parts) == 2:
        salt, expected_hex = parts
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(expected_hex, new_key.hex())

    return False

def generate_session_token(user_id: str, email: str) -> str:
    """
    Generates a secure HMAC-signed bearer session token.
    """
    payload = {
        "uid": user_id,
        "email": email,
        "exp": int(time.time()) + 86400 * 7  # 7 days
    }
    raw_payload = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    b64_payload = base64.urlsafe_b64encode(raw_payload).decode('utf-8').rstrip('=')
    sig = hmac.new(SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"aashray_{b64_payload}.{sig}"

def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies the HMAC signature and expiration of a session token.
    """
    if not token or not token.startswith("aashray_") or "." not in token:
        return None

    try:
        token_body = token[len("aashray_"):]
        b64_payload, sig = token_body.split(".", 1)
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), b64_payload.encode('utf-8'), hashlib.sha256).hexdigest()
        if not secrets.compare_digest(sig, expected_sig):
            return None

        # Pad base64 if needed
        padding = 4 - (len(b64_payload) % 4)
        if padding != 4:
            b64_payload += "=" * padding

        data = json.loads(base64.urlsafe_b64decode(b64_payload.encode('utf-8')).decode('utf-8'))
        if data.get("exp", 0) < time.time():
            return None
        return data
    except Exception:
        return None
