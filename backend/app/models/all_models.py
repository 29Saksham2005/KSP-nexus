from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Numeric, ForeignKey, Text
from app.core.database import Base

# ==============================================================================
# 1. MASTER & LOOKUP TABLES
# ==============================================================================

class CasteMaster(Base):
    __tablename__ = "castemaster"
    caste_master_id = Column("caste_master_id", Integer, primary_key=True)
    caste_master_name = Column("caste_master_name", String)

class ReligionMaster(Base):
    __tablename__ = "religionmaster"
    ReligionID = Column("religionid", Integer, primary_key=True)
    ReligionName = Column("religionname", String)

class OccupationMaster(Base):
    __tablename__ = "occupationmaster"
    OccupationID = Column("occupationid", Integer, primary_key=True)
    OccupationName = Column("occupationname", String)

class CaseStatusMaster(Base):
    __tablename__ = "casestatusmaster"
    CaseStatusID = Column("casestatusid", Integer, primary_key=True)
    CaseStatusName = Column("casestatusname", String)

class CaseCategory(Base):
    __tablename__ = "casecategory"
    CaseCategoryID = Column("casecategoryid", Integer, primary_key=True)
    LookupValue = Column("lookupvalue", String)

class GravityOffence(Base):
    __tablename__ = "gravityoffence"
    GravityOffenceID = Column("gravityoffenceid", Integer, primary_key=True)
    LookupValue = Column("lookupvalue", String)

class Act(Base):
    __tablename__ = "act"
    ActCode = Column("actcode", String, primary_key=True)
    ActDescription = Column("actdescription", String)
    ShortName = Column("shortname", String)
    Active = Column("active", Boolean)

class Section(Base):
    __tablename__ = "section"
    ActCode = Column("actcode", String, ForeignKey("act.actcode"), primary_key=True)
    SectionCode = Column("sectioncode", String, primary_key=True)
    SectionDescription = Column("sectiondescription", String)
    Active = Column("active", Boolean)

class CrimeHead(Base):
    __tablename__ = "crimehead"
    CrimeHeadID = Column("crimeheadid", Integer, primary_key=True)
    CrimeGroupName = Column("crimegroupname", String)
    Active = Column("active", Boolean)

class CrimeSubHead(Base):
    __tablename__ = "crimesubhead"
    CrimeSubHeadID = Column("crimesubheadid", Integer, primary_key=True)
    CrimeHeadID = Column("crimeheadid", Integer, ForeignKey("crimehead.crimeheadid"))
    CrimeHeadName = Column("crimeheadname", String)
    SeqID = Column("seqid", Integer)

# ==============================================================================
# 2. GEOGRAPHY & UNITS (STATIONS)
# ==============================================================================

class State(Base):
    __tablename__ = "state"
    StateID = Column("stateid", Integer, primary_key=True)
    StateName = Column("statename", String)
    NationalityID = Column("nationalityid", Integer)
    Active = Column("active", Boolean)

class District(Base):
    __tablename__ = "district"
    DistrictID = Column("districtid", Integer, primary_key=True)
    DistrictName = Column("districtname", String)
    StateID = Column("stateid", Integer, ForeignKey("state.stateid"))
    Active = Column("active", Boolean)

class Court(Base):
    __tablename__ = "court"
    CourtID = Column("courtid", Integer, primary_key=True)
    CourtName = Column("courtname", String)
    DistrictID = Column("districtid", Integer, ForeignKey("district.districtid"))
    StateID = Column("stateid", Integer, ForeignKey("state.stateid"))
    Active = Column("active", Boolean)

class UnitType(Base):
    __tablename__ = "unittype"
    UnitTypeID = Column("unittypeid", Integer, primary_key=True)
    UnitTypeName = Column("unittypename", String)
    City_Dist_State = Column("citydiststate", String)
    Hierarchy = Column("hierarchy", Integer)
    Active = Column("active", Boolean)

class Unit(Base):
    __tablename__ = "unit"
    UnitID = Column("unitid", Integer, primary_key=True)
    UnitName = Column("unitname", String)
    TypeID = Column("typeid", Integer, ForeignKey("unittype.unittypeid"))
    ParentUnit = Column("parentunit", Integer, ForeignKey("unit.unitid"))
    NationalityID = Column("nationalityid", Integer)
    StateID = Column("stateid", Integer, ForeignKey("state.stateid"))
    DistrictID = Column("districtid", Integer, ForeignKey("district.districtid"))
    Active = Column("active", Boolean)

# ==============================================================================
# 3. PERSONNEL (EMPLOYEES / OFFICERS)
# ==============================================================================

class Rank(Base):
    __tablename__ = "rank"
    RankID = Column("rankid", Integer, primary_key=True)
    RankName = Column("rankname", String)
    Hierarchy = Column("hierarchy", Integer)
    Active = Column("active", Boolean)

class Designation(Base):
    __tablename__ = "designation"
    DesignationID = Column("designationid", Integer, primary_key=True)
    DesignationName = Column("designationname", String)
    Active = Column("active", Boolean)
    SortOrder = Column("sortorder", Integer)

class Employee(Base):
    __tablename__ = "employee"
    EmployeeID = Column("employeeid", Integer, primary_key=True)
    DistrictID = Column("districtid", Integer, ForeignKey("district.districtid"))
    UnitID = Column("unitid", Integer, ForeignKey("unit.unitid"))
    RankID = Column("rankid", Integer, ForeignKey("rank.rankid"))
    DesignationID = Column("designationid", Integer, ForeignKey("designation.designationid"))
    KGID = Column("kgid", String)
    FirstName = Column("firstname", String)
    EmployeeDOB = Column("employeedob", Date)
    GenderID = Column("genderid", Integer)
    BloodGroupID = Column("bloodgroupid", Integer)
    Physically_Challenged = Column("physicallychallenged", Boolean)
    AppointmentDate = Column("appointmentdate", Date)

# ==============================================================================
# 4. CORE INVESTIGATION (FIR / CASE MASTER)
# ==============================================================================

class CaseMaster(Base):
    __tablename__ = "casemaster"
    CaseMasterID = Column("casemasterid", Integer, primary_key=True)
    CrimeNo = Column("crimeno", String) 
    CaseNo = Column("caseno", String)
    CrimeRegisteredDate = Column("crimeregistereddate", Date)
    PolicePersonID = Column("policepersonid", Integer, ForeignKey("employee.employeeid"))
    PoliceStationID = Column("policestationid", Integer, ForeignKey("unit.unitid"))
    CaseCategoryID = Column("casecategoryid", Integer, ForeignKey("casecategory.casecategoryid"))
    GravityOffenceID = Column("gravityoffenceid", Integer, ForeignKey("gravityoffence.gravityoffenceid"))
    CrimeMajorHeadID = Column("crimemajorheadid", Integer, ForeignKey("crimehead.crimeheadid"))
    CrimeMinorHeadID = Column("crimeminorheadid", Integer, ForeignKey("crimesubhead.crimesubheadid"))
    CaseStatusID = Column("casestatusid", Integer, ForeignKey("casestatusmaster.casestatusid"))
    CourtID = Column("courtid", Integer, ForeignKey("court.courtid"))
    IncidentFromDate = Column("incidentfromdate", DateTime)
    IncidentToDate = Column("incidenttodate", DateTime)
    InfoReceivedPSDate = Column("inforeceivedpsdate", DateTime)
    latitude = Column("latitude", Numeric)
    longitude = Column("longitude", Numeric)
    BriefFacts = Column("brieffacts", Text)

# ==============================================================================
# 5. CASE DETAILS (ENTITIES ATTACHED TO A CASE)
# ==============================================================================

class ComplainantDetails(Base):
    __tablename__ = "complainantdetails"
    ComplainantID = Column("complainantid", Integer, primary_key=True)
    CaseMasterID = Column("casemasterid", Integer, ForeignKey("casemaster.casemasterid"))
    ComplainantName = Column("complainantname", String)
    AgeYear = Column("ageyear", Integer)
    OccupationID = Column("occupationid", Integer, ForeignKey("occupationmaster.occupationid"))
    ReligionID = Column("religionid", Integer, ForeignKey("religionmaster.religionid"))
    CasteID = Column("casteid", Integer, ForeignKey("castemaster.caste_master_id"))
    GenderID = Column("genderid", Integer)

class Victim(Base):
    __tablename__ = "victim"
    VictimMasterID = Column("victimmasterid", Integer, primary_key=True)
    CaseMasterID = Column("casemasterid", Integer, ForeignKey("casemaster.casemasterid"))
    VictimName = Column("victimname", String)
    AgeYear = Column("ageyear", Integer)
    GenderID = Column("genderid", Integer)
    Victim_Police = Column("victimpolice", String)

class Accused(Base):
    __tablename__ = "accused"
    AccusedMasterID = Column("accusedmasterid", Integer, primary_key=True)
    CaseMasterID = Column("casemasterid", Integer, ForeignKey("casemaster.casemasterid"))
    AccusedName = Column("accusedname", String)
    AgeYear = Column("ageyear", Integer)
    GenderID = Column("genderid", Integer)
    PersonID = Column("personid", String)

class ArrestSurrender(Base):
    __tablename__ = "arrestsurrender"
    ArrestSurrenderID = Column("arrestsurrenderid", Integer, primary_key=True)
    CaseMasterID = Column("casemasterid", Integer, ForeignKey("casemaster.casemasterid"))
    ArrestSurrenderTypeID = Column("arrestsurrendertypeid", Integer)
    ArrestSurrenderDate = Column("arrestsurrenderdate", Date)
    ArrestSurrenderStateId = Column("arrestsurrenderstateid", Integer, ForeignKey("state.stateid"))
    ArrestSurrenderDistrictId = Column("arrestsurrenderdistrictid", Integer, ForeignKey("district.districtid"))
    PoliceStationID = Column("policestationid", Integer, ForeignKey("unit.unitid"))
    IOID = Column("ioid", Integer, ForeignKey("employee.employeeid"))
    CourtID = Column("courtid", Integer, ForeignKey("court.courtid"))
    AccusedMasterID = Column("accusedmasterid", Integer, ForeignKey("accused.accusedmasterid"))
    IsAccused = Column("isaccused", Boolean)
    IsComplainantAccused = Column("iscomplainantaccused", Boolean)

class ActSectionAssociation(Base):
    __tablename__ = "actsectionassociation"
    CaseMasterID = Column("casemasterid", Integer, ForeignKey("casemaster.casemasterid"), primary_key=True)
    ActID = Column("actid", String, primary_key=True)
    SectionID = Column("sectionid", String, primary_key=True)
    ActOrderID = Column("actorderid", Integer)
    SectionOrderID = Column("sectionorderid", Integer)

class CrimeHeadActSection(Base):
    __tablename__ = "crimeheadactsection"
    CrimeHeadID = Column("crimeheadid", Integer, ForeignKey("crimehead.crimeheadid"), primary_key=True)
    ActCode = Column("actcode", String, ForeignKey("act.actcode"), primary_key=True)
    SectionCode = Column("sectioncode", String, primary_key=True)

class ChargesheetDetails(Base):
    __tablename__ = "chargesheetdetails"
    CSID = Column("csid", Integer, primary_key=True)
    CaseMasterID = Column("casemasterid", Integer, ForeignKey("casemaster.casemasterid"))
    csdate = Column("csdate", DateTime)
    cstype = Column("cstype", String)
    PolicePersonID = Column("policepersonid", Integer, ForeignKey("employee.employeeid"))

# ==============================================================================
# 6. SYSTEM SECURITY (NEXUS SPECIFIC)
# ==============================================================================

class AuthUser(Base):
    __tablename__ = "auth_user"
    id = Column("id", Integer, primary_key=True, autoincrement=True)
    EmployeeID = Column("employeeid", Integer, ForeignKey("employee.employeeid"), unique=True)
    username = Column("username", String, unique=True, index=True)
    hashed_password = Column("hashed_password", String)
    role = Column("role", String, default="officer")