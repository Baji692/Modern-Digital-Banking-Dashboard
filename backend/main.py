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

import os

# -------------------------------------------------
# CORS CONFIGURATION
# -------------------------------------------------
    
# Create tables on startup
@app.on_event("startup")
def startup_event():
    import models
    from database import engine
    models.Base.metadata.create_all(bind=engine)
    print("Database tables initialized!")

# CORS Configuration - Custom Middleware (Hardened)
# This ensures headers are present EVEN on 500 errors.
@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Global Exception Handler (Safety Net)
from fastapi.responses import JSONResponse
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
        }
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
    return {
        "status": "FinBank API running",
        "version": "1.0.2",
        "cors_mode": "super-hardened"
    }
