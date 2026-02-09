import strawberry


@strawberry.type
class UserType:
    id: int
    username: str
    role: str
