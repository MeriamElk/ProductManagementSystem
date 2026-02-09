import strawberry
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.graphql.auth import get_current_user
from backend.app.graphql.types import ProductType, UserType
from backend.app.jwt_utils import create_access_token
from backend.app.models.product import Product
from backend.app.models.user import User, UserRole
from backend.app.security import hash_password, verify_password


@strawberry.input
class ProductInput:
    name: str
    description: Optional[str] = None
    price: float
    quantity: int


@strawberry.type
class AuthPayload:
    token: str
    user: UserType


@strawberry.type
class Mutation:

    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> UserType:
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
            role=UserRole.USER,  
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

        token = create_access_token(
            user_id=user.id,
            username=user.username,
            role=user.role.value,
        )

        return AuthPayload(
            token=token,
            user=UserType(id=user.id, username=user.username, role=user.role.value),
        )


    @strawberry.mutation(name="createProduct")
    def create_product(self, info, input: ProductInput) -> ProductType:
        request = info.context["request"]
        get_current_user(request)

        if not input.name or len(input.name) < 2:
            raise HTTPException(status_code=400, detail="Validation error: name")
        if input.price < 0:
            raise HTTPException(status_code=400, detail="Validation error: price")
        if input.quantity < 0:
            raise HTTPException(status_code=400, detail="Validation error: quantity")

        db: Session = SessionLocal()
        product = Product(
            name=input.name,
            description=input.description,
            price=input.price,
            quantity=input.quantity,
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        return ProductType(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            quantity=product.quantity,
        )

    @strawberry.mutation(name="updateProduct")
    def update_product(self, info, id: int, input: ProductInput) -> ProductType:
        request = info.context["request"]
        get_current_user(request)

        if not input.name or len(input.name) < 2:
            raise HTTPException(status_code=400, detail="Validation error: name")
        if input.price < 0:
            raise HTTPException(status_code=400, detail="Validation error: price")
        if input.quantity < 0:
            raise HTTPException(status_code=400, detail="Validation error: quantity")

        db: Session = SessionLocal()
        product = db.query(Product).filter(Product.id == id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        product.name = input.name
        product.description = input.description
        product.price = input.price
        product.quantity = input.quantity

        db.commit()
        db.refresh(product)

        return ProductType(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            quantity=product.quantity,
        )

    @strawberry.mutation(name="deleteProduct")
    def delete_product(self, info, id: int) -> bool:
        request = info.context["request"]
        user = get_current_user(request)

        if user.role.value != "ADMIN":
            raise HTTPException(status_code=403, detail="Forbidden")

        db: Session = SessionLocal()
        product = db.query(Product).filter(Product.id == id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        db.delete(product)
        db.commit()
        return True
