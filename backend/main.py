# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import models
from auth import router as auth_router
from routes import accounts, transactions, bills, budgets, budgets_enhanced, rewards, alerts, admin_logs, insights, exports, goals
from dotenv import load_dotenv

# -------------------------------------------------
# LOAD ENV FIRST (CRITICAL - MUST BE BEFORE ANY IMPORTS)
# -------------------------------------------------
load_dotenv()

# -------------------------------------------------
# NOW IMPORT MODULES THAT DEPEND ON ENV VARS
# -------------------------------------------------

# -------------------------------------------------
# IMPORT MODELS (REGISTER TABLES)
# -------------------------------------------------

# -------------------------------------------------
# IMPORT ROUTERS AFTER ENV IS READY
# -------------------------------------------------

# -------------------------------------------------
# CREATE FASTAPI APP
# -------------------------------------------------
app = FastAPI(
    title="FinBank API",
    version="0.1.0"
)

# -------------------------------------------------
# CORS CONFIGURATION
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
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
app.include_router(budgets.router)
app.include_router(budgets_enhanced.router)
app.include_router(rewards.router)
app.include_router(alerts.router)
app.include_router(admin_logs.router)
app.include_router(insights.router)
app.include_router(exports.router)
app.include_router(goals.router)

# -------------------------------------------------
# ROOT CHECK
# -------------------------------------------------


@app.get("/")
def root():
    return {"status": "FinBank API running"}
