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


class PersonBase(BaseModel):
    name: str
    age: int | None = None
    gender_id: int | None = None

class ComplainantSchema(PersonBase):
    pass

class VictimSchema(PersonBase):
    pass

class AccusedSchema(PersonBase):
    person_id: str | None = None

class ActSectionSchema(BaseModel):
    act_name: str
    section_code: str

class FIRDetailResponse(FIRResponse):
    """Extends the basic FIRResponse with deep relational data"""
    complainants: List[ComplainantSchema]
    victims: List[VictimSchema]
    accused: List[AccusedSchema]
    acts_sections: List[ActSectionSchema]