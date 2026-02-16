import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from jose import jwt, JWTError
from typing import Dict, Any, Optional

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
    Payload required by US-3.2:
      - userId
      - username
      - role
      - exp
    """
    settings = _get_jwt_settings()

    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings["expires_minutes"])

    payload = {
        "userId": user_id,      
        "username": username,
        "role": role,
        "exp": exp,
        "iat": now,             
    }

    return jwt.encode(payload, settings["secret"], algorithm=settings["algorithm"])


def decode_token(token: str) -> Dict[str, Any]:
    settings = _get_jwt_settings()

    try:
        return jwt.decode(
            token,
            settings["secret"],
            algorithms=[settings["algorithm"]],
        )
    except JWTError:
        raise ValueError("Invalid or expired token")


def get_bearer_token(headers: Dict[str, Any]) -> Optional[str]:
    auth = headers.get("authorization") or headers.get("Authorization")
    if not auth:
        return None

    if not auth.lower().startswith("bearer "):
        return None

    return auth.split(" ", 1)[1].strip()

