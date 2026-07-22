from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.all_models import AuthUser
from app.services.fir_service import fir_service
from app.schemas.fir import FIRPaginatedResponse

router = APIRouter(prefix="/firs", tags=["Investigation Workspace"])

@router.get("/", response_model=dict)
def get_firs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str = Query(None, description="Search by FIR number or summary"),
    status: str = Query(None, description="Filter by FIR status"),
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Returns a searchable, paginated list of FIRs (Cases).
    """
    total_count, items = fir_service.search_firs(
        db=db, 
        skip=skip, 
        limit=limit, 
        search_query=search, 
        status_filter=status
    )
    
    return {
        "success": True,
        "message": "FIR records retrieved successfully",
        "data": {
            "total_count": total_count,
            "items": [item.model_dump() for item in items]
        }
    }