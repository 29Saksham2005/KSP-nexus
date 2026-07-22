from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class FIRResponse(BaseModel):
    id: int 
    fir_number: str
    incident_date: date
    registration_date: date
    status: str
    summary: Optional[str] = None
    station_name: str
    category_name: str

class FIRPaginatedResponse(BaseModel):
    total_count: int
    items: List[FIRResponse]