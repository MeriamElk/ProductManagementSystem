import strawberry
from fastapi import HTTPException, Request
from jose import jwt
import os

from backend.app.models.user import User
from backend.app.database import SessionLocal
from backend.app.graphql.types import UserType


def get_current_user(request: Request) -> User:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = auth.split(" ")[1]

    secret = os.getenv("JWT_SECRET")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    payload = jwt.decode(token, secret, algorithms=[algorithm])
    user_id = payload.get("userid")

    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user


@strawberry.type
class Query:

    @strawberry.field
    def me(self, info) -> UserType:
        request = info.context["request"]
        user = get_current_user(request)
        return UserType(id=user.id, username=user.username, role=user.role.value)
