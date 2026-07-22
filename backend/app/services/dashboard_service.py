from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.all_models import FIR
from app.schemas.dashboard import KPIData, TrendDataPoint

class DashboardService:
    """
    Handles all statistical and aggregation business logic for Mission Control.
    """
    
    @staticmethod
    def get_kpis(db: Session) -> KPIData:
        """Calculates top-level Key Performance Indicators."""
        total_firs = db.query(func.count(FIR.id)).scalar() or 0
        
        active_investigations = db.query(func.count(FIR.id)).filter(
            FIR.status == "Under Investigation"
        ).scalar() or 0
        
        open_cases = db.query(func.count(FIR.id)).filter(
            FIR.status == "Open"
        ).scalar() or 0
        
        solved_cases = db.query(func.count(FIR.id)).filter(
            FIR.status == "Closed"
        ).scalar() or 0

        return KPIData(
            total_firs=total_firs,
            active_investigations=active_investigations,
            open_cases=open_cases,
            solved_cases=solved_cases
        )

    @staticmethod
    def get_trends(db: Session, period: str = "monthly") -> list[TrendDataPoint]:
        """
        Aggregates FIR counts over time.
        Defaults to grouping by month using PostgreSQL's date_trunc.
        """
        if period == "yearly":
            time_group = func.date_trunc('year', FIR.registration_date)
            date_format = "%Y"
        else:
            # Default to monthly
            time_group = func.date_trunc('month', FIR.registration_date)
            date_format = "%b %Y" # e.g., "Jan 2026"

        # Query the database to group by the truncated date and count FIRs
        results = (
            db.query(time_group.label('period'), func.count(FIR.id).label('count'))
            .group_by('period')
            .order_by('period')
            .all()
        )

        trends = []
        for row in results:
            if row.period:
                label = row.period.strftime(date_format)
                trends.append(TrendDataPoint(period_label=label, incident_count=row.count))
                
        return trends

dashboard_service = DashboardService()