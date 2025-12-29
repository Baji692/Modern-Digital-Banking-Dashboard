# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# IMPORTANT: import models so SQLAlchemy registers tables
import models

# Routers
from auth import router as auth_router
from routes import accounts, transactions, bills

# -------------------------------------------------
# CREATE FASTAPI APP (ONLY ONCE)
# -------------------------------------------------
app = FastAPI(
    title="FinBank API",
    version="0.1.0"
)

# -------------------------------------------------
# CORS CONFIGURATION (FOR REACT FRONTEND)
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# ROUTERS
# -------------------------------------------------
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(bills.router)

# -------------------------------------------------
# ROOT CHECK
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "FinBank API running"}
