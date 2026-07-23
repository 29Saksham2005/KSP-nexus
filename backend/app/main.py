from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.routers import auth
from app.api.routers import auth, dashboard
from app.api.routers import auth, dashboard, geo, fir
from app.api.routers import auth, dashboard, geo, fir, network  # Add network here


# 1. Initialize Database Tables
# Note: In a strict production environment, we rely purely on Alembic for this.
# For rapid hackathon iteration, this ensures tables are created if they don't exist.
#Base.metadata.create_all(bind=engine)

# 2. Initialize FastAPI Application
app = FastAPI(
    title="KSP NEXUS API",
    description="AI-powered Crime Intelligence Operating System",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# 3. Configure CORS (Cross-Origin Resource Sharing)
# Allowing our local React development server to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include API Routers
# All routes will be prefixed with /api/v1 as per the API Specification
app.include_router(auth.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(geo.router, prefix="/api/v1")
app.include_router(fir.router, prefix="/api/v1")
app.include_router(network.router, prefix="/api/v1")
# 5. Health Check Endpoint
@app.get("/api/v1/health", tags=["System"])
def health_check():
    """
    Standard health check endpoint to verify API availability.
    """
    return {
        "success": True,
        "message": "KSP NEXUS API is operational",
        "data": {"status": "healthy"}
    }