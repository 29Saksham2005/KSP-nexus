from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.all_models import User
from app.services.geo_service import geo_service

router = APIRouter(prefix="/geo", tags=["Geo Intelligence"])

@router.get("/stations")
def get_geo_stations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns spatial data and metrics for all police stations.
    """
    stations = geo_service.get_station_heatmap(db)
    
    return {
        "success": True,
        "message": "Spatial intelligence retrieved",
        "data": {"stations": [s.model_dump() for s in stations]}
    }