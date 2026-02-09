import os
from fastapi import HTTPException, Request
from jose import jwt

from backend.app.database import SessionLocal
from backend.app.models.user import User


def get_current_user(request: Request) -> User:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = auth.split(" ", 1)[1].strip()

    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="JWT_SECRET is missing")

    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = payload.get("userid")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user
