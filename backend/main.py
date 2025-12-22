# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from auth import router as auth_router

# Load environment variables
load_dotenv()

# -------------------------------------------------
# CREATE FASTAPI APP (ONLY ONCE)
# -------------------------------------------------
app = FastAPI()

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
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Auth"]
)

# -------------------------------------------------
# ROOT CHECK (OPTIONAL BUT SAFE)
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "FinBank API running"}
