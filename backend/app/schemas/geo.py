from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class GeoStationData(BaseModel):
    id: int
    station_name: str
    latitude: float
    longitude: float
    total_firs: int
    active_investigations: int

class GeoResponse(BaseModel):
    stations: List[GeoStationData]