from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.all_models import CaseMaster, Unit, CrimeHead, CaseStatusMaster, ComplainantDetails, Victim, Accused, ActSectionAssociation, Act
from app.schemas.fir import FIRResponse, FIRDetailResponse, ComplainantSchema, VictimSchema, AccusedSchema, ActSectionSchema
from fastapi import HTTPException
 
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
    @staticmethod
    def get_fir_details(db: Session, fir_id: int) -> FIRDetailResponse:
        # 1. Fetch the base case details
        result = db.query(CaseMaster, Unit, CrimeHead, CaseStatusMaster).join(
            Unit, CaseMaster.PoliceStationID == Unit.UnitID
        ).join(
            CrimeHead, CaseMaster.CrimeMajorHeadID == CrimeHead.CrimeHeadID
        ).join(
            CaseStatusMaster, CaseMaster.CaseStatusID == CaseStatusMaster.CaseStatusID
        ).filter(CaseMaster.CaseMasterID == fir_id).first()

        if not result:
            raise HTTPException(status_code=404, detail="FIR not found")
            
        case_rec, unit, crime_head, status = result
        
        # 2. Fetch related entities
        complainants = db.query(ComplainantDetails).filter(ComplainantDetails.CaseMasterID == fir_id).all()
        victims = db.query(Victim).filter(Victim.CaseMasterID == fir_id).all()
        accused_list = db.query(Accused).filter(Accused.CaseMasterID == fir_id).all()
        
        # Join ActSectionAssociation with Act to get the readable Act Name
        acts = db.query(ActSectionAssociation, Act).join(
            Act, ActSectionAssociation.ActID == Act.ActCode
        ).filter(ActSectionAssociation.CaseMasterID == fir_id).all()

        # 3. Map to our detailed Pydantic schema
        inc_date = case_rec.IncidentFromDate.date() if case_rec.IncidentFromDate else case_rec.CrimeRegisteredDate
        
        return FIRDetailResponse(
            id=case_rec.CaseMasterID,
            fir_number=case_rec.CrimeNo,
            incident_date=inc_date,
            registration_date=case_rec.CrimeRegisteredDate,
            status=status.CaseStatusName,
            summary=case_rec.BriefFacts,
            station_name=unit.UnitName,
            category_name=crime_head.CrimeGroupName,
            complainants=[ComplainantSchema(name=c.ComplainantName, age=c.AgeYear, gender_id=c.GenderID) for c in complainants],
            victims=[VictimSchema(name=v.VictimName, age=v.AgeYear, gender_id=v.GenderID) for v in victims],
            accused=[AccusedSchema(name=a.AccusedName, age=a.AgeYear, gender_id=a.GenderID, person_id=a.PersonID) for a in accused_list],
            acts_sections=[ActSectionSchema(act_name=a.ActDescription, section_code=assoc.SectionID) for assoc, a in acts]
        )

fir_service = FIRService()