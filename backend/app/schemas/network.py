from pydantic import BaseModel
from typing import List

class Node(BaseModel):
    id: str
    name: str
    group: str  # 'person' or 'case'
    val: int    # Determines the size of the node visually
    category: str | None = None  # Added category
    date: str | None = None      # Added date
class Link(BaseModel):
    source: str
    target: str

class GraphData(BaseModel):
    nodes: List[Node]
    links: List[Link]