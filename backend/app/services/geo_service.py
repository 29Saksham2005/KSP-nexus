from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.all_models import PoliceStation, FIR
from app.schemas.geo import GeoStationData

class GeoService:
    @staticmethod
    def get_station_heatmap(db: Session) -> list[GeoStationData]:
        """
        Retrieves all police stations along with their exact coordinates 
        and current FIR counts to power the frontend map.
        """
        # We query the stations and aggregate the FIRs in a single database hit
        # using 'case' for safe, cross-database conditional counting
        results = (
            db.query(
                PoliceStation,
                func.count(FIR.id).label("total_firs"),
                func.sum(
                    case((FIR.status == 'Under Investigation', 1), else_=0)
                ).label("active_investigations")
            )
            .outerjoin(FIR, PoliceStation.id == FIR.police_station_id)
            .group_by(PoliceStation.id)
            .all()
        )

        station_data = []
        for station, total, active in results:
            if station.latitude and station.longitude:
                station_data.append(
                    GeoStationData(
                        id=station.id,
                        station_name=station.station_name,
                        latitude=float(station.latitude),
                        longitude=float(station.longitude),
                        total_firs=total or 0,
                        active_investigations=active or 0
                    )
                )
                
        return station_data

geo_service = GeoService()