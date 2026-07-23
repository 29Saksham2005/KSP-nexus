from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.all_models import Unit, CaseMaster
from app.schemas.geo import GeoStationData

class GeoService:
    @staticmethod
    def get_station_heatmap(db: Session) -> list[GeoStationData]:
        # Group by Unit and average the case coordinates to place the station marker
        results = (
            db.query(
                Unit.UnitID,
                Unit.UnitName,
                func.avg(CaseMaster.latitude).label("lat"),
                func.avg(CaseMaster.longitude).label("lon"),
                func.count(CaseMaster.CaseMasterID).label("total_firs"),
                func.sum(
                    case((CaseMaster.CaseStatusID == 1, 1), else_=0)
                ).label("active_investigations")
            )
            .join(CaseMaster, Unit.UnitID == CaseMaster.PoliceStationID)
            .group_by(Unit.UnitID, Unit.UnitName)
            .all()
        )

        station_data = []
        for row in results:
            if row.lat and row.lon:
                station_data.append(
                    GeoStationData(
                        id=row.UnitID,
                        station_name=row.UnitName,
                        latitude=float(row.lat),
                        longitude=float(row.lon),
                        total_firs=row.total_firs or 0,
                        active_investigations=row.active_investigations or 0
                    )
                )
                
        return station_data
    @staticmethod
    def get_crime_locations(db: Session, limit: int = 1000):
        # Fetch individual cases that have valid geographic coordinates
        from app.models.all_models import CaseMaster, CrimeHead
        from app.schemas.geo import GeoPoint
        
        results = (
            db.query(CaseMaster, CrimeHead)
            .outerjoin(CrimeHead, CaseMaster.CrimeMajorHeadID == CrimeHead.CrimeHeadID)
            .filter(CaseMaster.latitude.isnot(None))
            .filter(CaseMaster.longitude.isnot(None))
            .limit(limit)
            .all()
        )

        geo_points = []
        for case_rec, crime_head in results:
            try:
                lat = float(case_rec.latitude)
                lng = float(case_rec.longitude)
                
                # Basic validation to ensure coordinates are realistic (roughly bounding India)
                if 8.0 < lat < 38.0 and 68.0 < lng < 98.0:
                    geo_points.append(
                        GeoPoint(
                            id=case_rec.CaseMasterID,
                            fir_number=case_rec.CrimeNo,
                            category=crime_head.CrimeGroupName if crime_head else "Unknown",
                            latitude=lat,
                            longitude=lng
                        )
                    )
            except (ValueError, TypeError):
                continue # Skip invalid coordinate formats

        return geo_points

geo_service = GeoService()