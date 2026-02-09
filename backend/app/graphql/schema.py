import strawberry
from backend.app.graphql.queries import Query
from backend.app.graphql.mutations import Mutation

schema = strawberry.Schema(query=Query, mutation=Mutation)
