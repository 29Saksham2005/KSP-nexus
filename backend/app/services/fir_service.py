from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.all_models import CaseMaster, Unit, CrimeHead, CaseStatusMaster
from app.schemas.fir import FIRResponse

class FIRService:
    @staticmethod
    def search_firs(
        db: Session, 
        skip: int = 0, 
        limit: int = 50,
        search_query: str = None,
        status_filter: str = None
    ) -> tuple[int, list[FIRResponse]]:
        
        # Start base query joining the official schema tables
        query = db.query(CaseMaster, Unit, CrimeHead, CaseStatusMaster).join(
            Unit, CaseMaster.PoliceStationID == Unit.UnitID
        ).join(
            CrimeHead, CaseMaster.CrimeMajorHeadID == CrimeHead.CrimeHeadID
        ).join(
            CaseStatusMaster, CaseMaster.CaseStatusID == CaseStatusMaster.CaseStatusID
        )

        # Search by CrimeNo (FIR number) or BriefFacts (Summary)
        if search_query:
            query = query.filter(
                or_(
                    CaseMaster.CrimeNo.ilike(f"%{search_query}%"),
                    CaseMaster.BriefFacts.ilike(f"%{search_query}%")
                )
            )

        # Filter by Case Status
        if status_filter and status_filter != "All":
            query = query.filter(CaseStatusMaster.CaseStatusName == status_filter)

        total_count = query.count()
        results = query.order_by(CaseMaster.CrimeRegisteredDate.desc()).offset(skip).limit(limit).all()

        fir_items = []
        for case_rec, unit, crime_head, status in results:
            # Handle potential null incident dates by falling back to registration date
            inc_date = case_rec.IncidentFromDate.date() if case_rec.IncidentFromDate else case_rec.CrimeRegisteredDate
            
            fir_items.append(
                FIRResponse(
                    id=case_rec.CaseMasterID,
                    fir_number=case_rec.CrimeNo,
                    incident_date=inc_date,
                    registration_date=case_rec.CrimeRegisteredDate,
                    status=status.CaseStatusName,
                    summary=case_rec.BriefFacts,
                    station_name=unit.UnitName,
                    category_name=crime_head.CrimeGroupName
                )
            )

        return total_count, fir_items

fir_service = FIRService()