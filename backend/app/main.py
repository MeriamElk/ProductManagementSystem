from fastapi import FastAPI
from backend.app.database import test_db_connection, create_tables

app = FastAPI(title="Product Management System API")


@app.on_event("startup")
def startup_event():
    test_db_connection()
    create_tables()


@app.get("/health")
def health_check():
    return {"status": "UP"}
