import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from jose import jwt


def _get_jwt_settings() -> Dict[str, Any]:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET is missing")

    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expires_minutes_str = os.getenv("JWT_EXPIRES_MINUTES", "60")

    try:
        expires_minutes = int(expires_minutes_str)
    except ValueError:
        raise RuntimeError("JWT_EXPIRES_MINUTES must be an integer")

    return {
        "secret": secret,
        "algorithm": algorithm,
        "expires_minutes": expires_minutes,
    }


def create_access_token(*, user_id: int, username: str, role: str) -> str:
    """
    Create a JWT access token.
    Payload required by the US:
      - userid
      - username
      - role
      - exp
    """
    settings = _get_jwt_settings()

    exp = datetime.now(timezone.utc) + timedelta(minutes=settings["expires_minutes"])
    payload = {
        "userid": user_id,
        "username": username,
        "role": role,
        "exp": exp,
    }

    return jwt.encode(payload, settings["secret"], algorithm=settings["algorithm"])
