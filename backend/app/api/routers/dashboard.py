from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.all_models import User
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Mission Control"])

@router.get("/kpis")
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns KPI metrics for the Mission Control dashboard.
    Follows API Spec: GET /dashboard/kpis
    """
    kpi_data = dashboard_service.get_kpis(db)
    
    return {
        "success": True,
        "message": "KPIs retrieved successfully",
        "data": kpi_data.model_dump()
    }

@router.get("/trends")
def get_dashboard_trends(
    period: str = Query("monthly", regex="^(monthly|yearly)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns crime trend data over time.
    Follows API Spec: GET /dashboard/trends
    """
    trend_data = dashboard_service.get_trends(db, period)
    
    return {
        "success": True,
        "message": f"Trends retrieved successfully for period: {period}",
        "data": {"trends": [t.model_dump() for t in trend_data]}
    }