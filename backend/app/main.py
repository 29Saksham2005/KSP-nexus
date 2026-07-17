from fastapi import FastAPI

from app.api.router import router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Welcome to KSP NEXUS API"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }