import strawberry
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.graphql.auth import get_current_user
from backend.app.graphql.types import UserType, ProductType
from backend.app.models.product import Product


@strawberry.type
class Query:
    @strawberry.field
    def me(self, info) -> UserType:
        request = info.context["request"]
        user = get_current_user(request)
        return UserType(id=user.id, username=user.username, role=user.role.value)

    @strawberry.field
    def products(self, info) -> List[ProductType]:
        # Auth required
        request = info.context["request"]
        get_current_user(request)

        db: Session = SessionLocal()
        products = db.query(Product).order_by(Product.created_at.desc()).all()

        return [
            ProductType(
                id=p.id,
                name=p.name,
                description=p.description,
                price=float(p.price),
                quantity=p.quantity,
            )
            for p in products
        ]

    @strawberry.field(name="productById")
    def product_by_id(self, info, id: int) -> ProductType:
        # Auth required
        request = info.context["request"]
        get_current_user(request)

        db: Session = SessionLocal()
        product = db.query(Product).filter(Product.id == id).first()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return ProductType(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            quantity=product.quantity,
        )
