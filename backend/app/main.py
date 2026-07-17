from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
    )

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Welcome to KSP NEXUS API"
        }

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()