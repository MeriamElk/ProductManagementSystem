from fastapi import FastAPI, Request
from strawberry.fastapi import GraphQLRouter

from pathlib import Path
from dotenv import load_dotenv

from backend.app.database import test_db_connection, create_tables
from backend.app.graphql.schema import schema

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="Product Management System API")


@app.on_event("startup")
def startup_event():
    test_db_connection()
    create_tables()


async def get_context(request: Request):
    return {"request": request}


graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True,          
)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/health")
def health_check():
    return {"status": "UP"}
