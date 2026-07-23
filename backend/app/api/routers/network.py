from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.all_models import AuthUser
from app.services.network_service import network_service
from app.schemas.network import GraphData

router = APIRouter(prefix="/network", tags=["Network Intelligence"])

@router.get("/link-analysis", response_model=dict)
def get_link_analysis(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Returns a graph payload of repeat offenders and their interconnected cases.
    """
    graph_data = network_service.get_criminal_network(db)
    
    return {
        "success": True,
        "message": "Network graph retrieved successfully",
        "data": graph_data.model_dump()
    }