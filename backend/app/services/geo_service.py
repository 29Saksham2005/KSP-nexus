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

geo_service = GeoService()