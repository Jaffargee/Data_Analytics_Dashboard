from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, sales

settings = get_settings()

app = FastAPI(
    title="Tahir General — Sales Bridge",
    description=(
        "Receives sale requests from the POS frontend, validates them, and "
        "forwards them to pos4africa.com. See app/services/pos4africa_client.py "
        "for what's real vs. still a placeholder."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(sales.router)
