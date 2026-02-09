import strawberry
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.models.user import User, UserRole
from backend.app.security import hash_password, verify_password
from backend.app.jwt_utils import create_access_token
from backend.app.graphql.types import UserType


@strawberry.type
class AuthPayload:
    token: str
    user: UserType


@strawberry.type
class Mutation:

    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> UserType:
        # validations (PDF)
        if not username:
            raise HTTPException(status_code=400, detail="username required")
        if not email:
            raise HTTPException(status_code=400, detail="email required")
        if not password or len(password) < 6:
            raise HTTPException(status_code=400, detail="password required (min 6)")

        db: Session = SessionLocal()

        if db.query(User).filter(User.username == username).first():
            raise HTTPException(status_code=400, detail="Username already exists")

        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="Email already exists")

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role=UserRole.USER,  # default USER
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return UserType(id=user.id, username=user.username, role=user.role.value)

    @strawberry.mutation
    def login(self, username: str, password: str) -> AuthPayload:
        db: Session = SessionLocal()

        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(user_id=user.id, username=user.username, role=user.role.value)

        return AuthPayload(
            token=token,
            user=UserType(id=user.id, username=user.username, role=user.role.value),
        )
