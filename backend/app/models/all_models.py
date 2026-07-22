import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Text, DECIMAL, Date, DateTime, 
    ForeignKey, Table
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

# ==========================================
# JUNCTION TABLES (Many-to-Many)
# ==========================================

fir_persons = Table(
    "fir_persons",
    Base.metadata,
    Column("fir_id", UUID(as_uuid=True), ForeignKey("firs.id", ondelete="CASCADE"), primary_key=True),
    Column("person_id", UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"), primary_key=True),
    Column("role_in_case", String(50), nullable=False) # e.g., Accused, Victim, Witness, Informant, Suspect
)

fir_officers = Table(
    "fir_officers",
    Base.metadata,
    Column("fir_id", UUID(as_uuid=True), ForeignKey("firs.id", ondelete="CASCADE"), primary_key=True),
    Column("officer_id", UUID(as_uuid=True), ForeignKey("officers.id", ondelete="CASCADE"), primary_key=True),
    Column("assignment_role", String(50), nullable=False) # e.g., Investigating Officer, Supervising Officer
)


# ==========================================
# ADMINISTRATIVE ENTITIES
# ==========================================

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    full_name = Column(String(150), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    role = relationship("Role", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")


class District(Base):
    __tablename__ = "districts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district_name = Column(String(100), unique=True, nullable=False)
    state = Column(String(100), default="Karnataka", nullable=False)
    
    police_stations = relationship("PoliceStation", back_populates="district")


class PoliceStation(Base):
    __tablename__ = "police_stations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    station_name = Column(String(150), nullable=False)
    latitude = Column(DECIMAL(10, 8), nullable=True)
    longitude = Column(DECIMAL(11, 8), nullable=True)
    
    district = relationship("District", back_populates="police_stations")
    firs = relationship("FIR", back_populates="police_station")
    officers = relationship("Officer", back_populates="station")


class CrimeCategory(Base):
    __tablename__ = "crime_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_name = Column(String(150), unique=True, nullable=False)
    ipc_sections = Column(Text, nullable=True)
    
    firs = relationship("FIR", back_populates="crime_category")


# ==========================================
# OPERATIONAL ENTITIES
# ==========================================

class FIR(Base):
    __tablename__ = "firs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fir_number = Column(String(100), unique=True, nullable=False)
    police_station_id = Column(UUID(as_uuid=True), ForeignKey("police_stations.id", ondelete="RESTRICT"), nullable=False)
    crime_category_id = Column(UUID(as_uuid=True), ForeignKey("crime_categories.id", ondelete="RESTRICT"), nullable=False)
    incident_date = Column(Date, nullable=False)
    registration_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False) # Open, Under Investigation, Closed
    summary = Column(Text, nullable=True)
    
    police_station = relationship("PoliceStation", back_populates="firs")
    crime_category = relationship("CrimeCategory", back_populates="firs")
    
    evidence = relationship("Evidence", back_populates="fir", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="fir", cascade="all, delete-orphan")
    
    persons = relationship("Person", secondary=fir_persons, back_populates="firs")
    officers = relationship("Officer", secondary=fir_officers, back_populates="firs")


class Person(Base):
    __tablename__ = "persons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(150), nullable=False)
    gender = Column(String(20), nullable=True)
    age = Column(Integer, nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    
    firs = relationship("FIR", secondary=fir_persons, back_populates="persons")
    vehicles = relationship("Vehicle", back_populates="owner")


class Officer(Base):
    __tablename__ = "officers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    officer_name = Column(String(150), nullable=False)
    badge_number = Column(String(50), unique=True, nullable=False)
    rank = Column(String(100), nullable=False)
    station_id = Column(UUID(as_uuid=True), ForeignKey("police_stations.id", ondelete="RESTRICT"), nullable=True)
    
    station = relationship("PoliceStation", back_populates="officers")
    firs = relationship("FIR", secondary=fir_officers, back_populates="officers")


class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_number = Column(String(50), unique=True, nullable=False)
    owner_person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="RESTRICT"), nullable=True)
    vehicle_type = Column(String(100), nullable=True)
    
    owner = relationship("Person", back_populates="vehicles")


class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fir_id = Column(UUID(as_uuid=True), ForeignKey("firs.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    collected_date = Column(Date, nullable=False)
    
    fir = relationship("FIR", back_populates="evidence")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fir_id = Column(UUID(as_uuid=True), ForeignKey("firs.id", ondelete="CASCADE"), nullable=False)
    event_time = Column(DateTime, nullable=False)
    event_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    fir = relationship("FIR", back_populates="timeline_events")


# ==========================================
# SYSTEM ENTITIES
# ==========================================

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    action = Column(String(200), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(50), nullable=True)
    
    user = relationship("User", back_populates="audit_logs")