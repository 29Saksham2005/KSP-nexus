from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.all_models import CaseMaster
from app.schemas.dashboard import KPIData, TrendDataPoint

class DashboardService:
    @staticmethod
    def get_kpis(db: Session) -> KPIData:
        total_cases = db.query(func.count(CaseMaster.CaseMasterID)).scalar() or 0
        
        # CaseStatusID 1 = Under Investigation
        active_investigations = db.query(func.count(CaseMaster.CaseMasterID)).filter(
            CaseMaster.CaseStatusID == 1
        ).scalar() or 0
        
        # CaseStatusID 1 & 2 = Active & Charge Sheeted (still processing in courts)
        open_cases = db.query(func.count(CaseMaster.CaseMasterID)).filter(
            CaseMaster.CaseStatusID.in_([1, 2])
        ).scalar() or 0
        
        # CaseStatusID 3 = Closed
        solved_cases = db.query(func.count(CaseMaster.CaseMasterID)).filter(
            CaseMaster.CaseStatusID == 3
        ).scalar() or 0

        return KPIData(
            total_firs=total_cases,
            active_investigations=active_investigations,
            open_cases=open_cases,
            solved_cases=solved_cases
        )

    @staticmethod
    def get_trends(db: Session, period: str = "monthly") -> list[TrendDataPoint]:
        if period == "yearly":
            time_group = func.date_trunc('year', CaseMaster.CrimeRegisteredDate)
            date_format = "%Y"
        else:
            time_group = func.date_trunc('month', CaseMaster.CrimeRegisteredDate)
            date_format = "%b %Y"

        results = (
            db.query(time_group.label('period'), func.count(CaseMaster.CaseMasterID).label('count'))
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