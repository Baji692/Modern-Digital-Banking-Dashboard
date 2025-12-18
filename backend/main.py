from fastapi import FastAPI
from auth import router
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bank Dashboard Backend")

app.include_router(router)
