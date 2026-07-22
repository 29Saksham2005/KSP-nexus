from pydantic import BaseModel
from typing import List

# ==========================================
# KPI SCHEMAS
# ==========================================
class KPIData(BaseModel):
    total_firs: int
    active_investigations: int
    open_cases: int
    solved_cases: int

# ==========================================
# TREND SCHEMAS
# ==========================================
class TrendDataPoint(BaseModel):
    period_label: str
    incident_count: int

class TrendResponseData(BaseModel):
    trends: List[TrendDataPoint]