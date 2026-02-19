import strawberry
from typing import Optional


@strawberry.type
class UserType:
    id: int
    username: str
    role: str


@strawberry.type
class ProductType:
    id: int
    name: str
    description: Optional[str]
    price: float
    quantity: int
