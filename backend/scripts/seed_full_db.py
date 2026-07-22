
import random
import datetime
import psycopg2
# Import our hashing function
from app.core.security import get_password_hash
# Configuration
NUM_CASES = 2500

# ------------------------------------------------------------------------
# 1. ALL 31 KARNATAKA DISTRICT CENTROIDS (Latitude, Longitude)
# ------------------------------------------------------------------------
KARNATAKA_DISTRICTS = {
    101: {"name": "Bengaluru Urban", "lat": 12.9716, "lon": 77.5946},
    102: {"name": "Bengaluru Rural", "lat": 13.2750, "lon": 77.5500},
    103: {"name": "Ramanagara", "lat": 12.7214, "lon": 77.2796},
    104: {"name": "Chitradurga", "lat": 14.2231, "lon": 76.3999},
    105: {"name": "Davanagere", "lat": 14.4644, "lon": 75.9218},
    106: {"name": "Kolar", "lat": 13.1367, "lon": 78.1292},
    107: {"name": "Chikkaballapura", "lat": 13.4325, "lon": 77.7274},
    108: {"name": "Tumakuru", "lat": 13.3379, "lon": 77.1173},
    109: {"name": "Shivamogga", "lat": 13.9299, "lon": 75.5681},
    110: {"name": "Mysuru", "lat": 12.2958, "lon": 76.6394},
    111: {"name": "Chamarajanagara", "lat": 11.9261, "lon": 76.9400},
    112: {"name": "Mandya", "lat": 12.5218, "lon": 76.8951},
    113: {"name": "Hassan", "lat": 13.0033, "lon": 76.1004},
    114: {"name": "Chikkamagaluru", "lat": 13.3153, "lon": 75.7754},
    115: {"name": "Kodagu", "lat": 12.3375, "lon": 75.8069},
    116: {"name": "Udupi", "lat": 13.3409, "lon": 74.7421},
    117: {"name": "Dakshina Kannada (Mangaluru)", "lat": 12.9141, "lon": 74.8560},
    118: {"name": "Belagavi", "lat": 15.8497, "lon": 74.4977},
    119: {"name": "Bagalkot", "lat": 16.1691, "lon": 75.6615},
    120: {"name": "Vijayapura", "lat": 16.8302, "lon": 75.7100},
    121: {"name": "Dharwad", "lat": 15.4589, "lon": 75.0078},
    122: {"name": "Gadag", "lat": 15.4300, "lon": 75.6333},
    123: {"name": "Haveri", "lat": 14.7937, "lon": 75.4022},
    124: {"name": "Uttara Kannada", "lat": 14.8055, "lon": 74.6300},
    125: {"name": "Kalaburagi", "lat": 17.3297, "lon": 76.8343},
    126: {"name": "Bidar", "lat": 17.9104, "lon": 77.5199},
    127: {"name": "Raichur", "lat": 16.1950, "lon": 77.3486},
    128: {"name": "Koppal", "lat": 15.3500, "lon": 76.1500},
    129: {"name": "Yadgir", "lat": 16.7645, "lon": 77.1390},
    130: {"name": "Ballari", "lat": 15.1394, "lon": 76.9214},
    131: {"name": "Vijayanagara", "lat": 15.2717, "lon": 76.3860}
}

FIRST_NAMES = [
    "Ramesh", "Suresh", "Ganesh", "Manjunath", "Ananya", "Priya", "Kavya", 
    "Venkatesh", "Chethan", "Pradeep", "Syed", "Mohammed", "Anthony", "Deepa",
    "Basavaraj", "Shivakumar", "Nagaraj", "Lakshmi", "Sunitha", "Vijay"
]

LAST_NAMES = [
    "Gowda", "Patil", "Shetty", "Hegde", "Nayak", "Rao", "Kulkarni", 
    "Pujari", "Kuruba", "Bhat", "Ibrahim", "Fernandes", "Reddy", "Kamble"
]

STREET_FACTS = [
    "Complainant reported theft of a two-wheeler parked near the market area.",
    "Physical altercation reported following a verbal argument over land boundary.",
    "Chain snatching incident reported by victim while returning from temple.",
    "House break-in observed during night hours while family was out of station.",
    "Commercial shop burglary detected during morning opening hours.",
    "Cyber fraud reported involving unauthorized OTP extraction and bank debit.",
    "Road traffic accident involving rash driving resulting in grievous injuries."
]

def generate_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def random_date(start_year=2024, end_year=2026):
    start = datetime.date(start_year, 1, 1)
    end = datetime.date(end_year, 12, 31)
    return start + datetime.timedelta(days=random.randint(0, (end - start).days))

def get_district_lat_lon(district_id):
    """Generates localized coordinates around the actual district center."""
    centroid = KARNATAKA_DISTRICTS.get(district_id, {"lat": 12.9716, "lon": 77.5946})
    lat = round(centroid["lat"] + random.uniform(-0.05, 0.05), 6)
    lon = round(centroid["lon"] + random.uniform(-0.05, 0.05), 6)
    return lat, lon

def generate_and_populate_db():
    try:
        conn = psycopg2.connect(
            dbname="ksp_nexus",
            user="postgres",
            password="postgres",
            host="127.0.0.1",
            port="5432"
        )
        cur = conn.cursor()
        print("✅ Connected successfully to PostgreSQL!")
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return

    print("⏳ Dropping existing tables & view...")
    ddl_drop = """
    DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_analytics CASCADE;
    DROP TABLE IF EXISTS ChargesheetDetails CASCADE;
    DROP TABLE IF EXISTS inv_arrestsurrenderaccused CASCADE;
    DROP TABLE IF EXISTS ArrestSurrender CASCADE;
    DROP TABLE IF EXISTS Accused CASCADE;
    DROP TABLE IF EXISTS Victim CASCADE;
    DROP TABLE IF EXISTS ActSectionAssociation CASCADE;
    DROP TABLE IF EXISTS ComplainantDetails CASCADE;
    DROP TABLE IF EXISTS CaseMaster CASCADE;
    DROP TABLE IF EXISTS CrimeHeadActSection CASCADE;
    DROP TABLE IF EXISTS Section CASCADE;
    DROP TABLE IF EXISTS Act CASCADE;
    DROP TABLE IF EXISTS CrimeSubHead CASCADE;
    DROP TABLE IF EXISTS CrimeHead CASCADE;
    DROP TABLE IF EXISTS Court CASCADE;
    DROP TABLE IF EXISTS Employee CASCADE;
    DROP TABLE IF EXISTS Unit CASCADE;
    DROP TABLE IF EXISTS UnitType CASCADE;
    DROP TABLE IF EXISTS District CASCADE;
    DROP TABLE IF EXISTS State CASCADE;
    DROP TABLE IF EXISTS Rank CASCADE;
    DROP TABLE IF EXISTS Designation CASCADE;
    DROP TABLE IF EXISTS CaseCategory CASCADE;
    DROP TABLE IF EXISTS GravityOffence CASCADE;
    DROP TABLE IF EXISTS CaseStatusMaster CASCADE;
    DROP TABLE IF EXISTS OccupationMaster CASCADE;
    DROP TABLE IF EXISTS ReligionMaster CASCADE;
    DROP TABLE IF EXISTS CasteMaster CASCADE;
    DROP TABLE IF EXISTS auth_user CASCADE;
    """
    cur.execute(ddl_drop)

    print("🛠️ Creating tables schema...")
    ddl_create = """
    CREATE TABLE State (StateID INT PRIMARY KEY, StateName VARCHAR(100), NationalityID INT, Active BOOLEAN);
    CREATE TABLE District (DistrictID INT PRIMARY KEY, DistrictName VARCHAR(100), StateID INT REFERENCES State(StateID), Active BOOLEAN);
    CREATE TABLE UnitType (UnitTypeID INT PRIMARY KEY, UnitTypeName VARCHAR(100), City_Dist_State VARCHAR(50), Hierarchy INT, Active BOOLEAN);
    CREATE TABLE Unit (UnitID INT PRIMARY KEY, UnitName VARCHAR(150), TypeID INT REFERENCES UnitType(UnitTypeID), ParentUnit INT, NationalityID INT, StateID INT REFERENCES State(StateID), DistrictID INT REFERENCES District(DistrictID), Active BOOLEAN);
    CREATE TABLE Rank (RankID INT PRIMARY KEY, RankName VARCHAR(100), Hierarchy INT, Active BOOLEAN);
    CREATE TABLE Designation (DesignationID INT PRIMARY KEY, DesignationName VARCHAR(100), Active BOOLEAN, SortOrder INT);
    CREATE TABLE Employee (EmployeeID INT PRIMARY KEY, DistrictID INT REFERENCES District(DistrictID), UnitID INT REFERENCES Unit(UnitID), RankID INT REFERENCES Rank(RankID), DesignationID INT REFERENCES Designation(DesignationID), KGID VARCHAR(50) UNIQUE, FirstName VARCHAR(100), EmployeeDOB DATE, GenderID INT, BloodGroupID INT, PhysicallyChallenged BOOLEAN, AppointmentDate DATE);
    CREATE TABLE CaseCategory (CaseCategoryID INT PRIMARY KEY, LookupValue VARCHAR(50));
    CREATE TABLE GravityOffence (GravityOffenceID INT PRIMARY KEY, LookupValue VARCHAR(50));
    CREATE TABLE CrimeHead (CrimeHeadID INT PRIMARY KEY, CrimeGroupName VARCHAR(150), Active BOOLEAN);
    CREATE TABLE CrimeSubHead (CrimeSubHeadID INT PRIMARY KEY, CrimeHeadID INT REFERENCES CrimeHead(CrimeHeadID), CrimeHeadName VARCHAR(150), SeqID INT);
    CREATE TABLE Act (ActCode VARCHAR(50) PRIMARY KEY, ActDescription VARCHAR(255), ShortName VARCHAR(50), Active BOOLEAN);
    CREATE TABLE Section (ActCode VARCHAR(50) REFERENCES Act(ActCode), SectionCode VARCHAR(50), SectionDescription VARCHAR(255), Active BOOLEAN, PRIMARY KEY (ActCode, SectionCode));
    CREATE TABLE CrimeHeadActSection (CrimeHeadID INT REFERENCES CrimeHead(CrimeHeadID), ActCode VARCHAR(50) REFERENCES Act(ActCode), SectionCode VARCHAR(50));
    CREATE TABLE CasteMaster (caste_master_id INT PRIMARY KEY, caste_master_name VARCHAR(100));
    CREATE TABLE ReligionMaster (ReligionID INT PRIMARY KEY, ReligionName VARCHAR(100));
    CREATE TABLE OccupationMaster (OccupationID INT PRIMARY KEY, OccupationName VARCHAR(100));
    CREATE TABLE CaseStatusMaster (CaseStatusID INT PRIMARY KEY, CaseStatusName VARCHAR(100));
    CREATE TABLE Court (CourtID INT PRIMARY KEY, CourtName VARCHAR(150), DistrictID INT REFERENCES District(DistrictID), StateID INT REFERENCES State(StateID), Active BOOLEAN);

    CREATE TABLE CaseMaster (
        CaseMasterID INT PRIMARY KEY,
        CrimeNo VARCHAR(50),
        CaseNo VARCHAR(50),
        CrimeRegisteredDate DATE,
        PolicePersonID INT REFERENCES Employee(EmployeeID),
        PoliceStationID INT REFERENCES Unit(UnitID),
        CaseCategoryID INT REFERENCES CaseCategory(CaseCategoryID),
        GravityOffenceID INT REFERENCES GravityOffence(GravityOffenceID),
        CrimeMajorHeadID INT REFERENCES CrimeHead(CrimeHeadID),
        CrimeMinorHeadID INT REFERENCES CrimeSubHead(CrimeSubHeadID),
        CaseStatusID INT REFERENCES CaseStatusMaster(CaseStatusID),
        CourtID INT REFERENCES Court(CourtID),
        IncidentFromDate TIMESTAMP,
        IncidentToDate TIMESTAMP,
        InfoReceivedPSDate TIMESTAMP,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        BriefFacts TEXT
    );

    CREATE TABLE ComplainantDetails (ComplainantID INT PRIMARY KEY, CaseMasterID INT REFERENCES CaseMaster(CaseMasterID), ComplainantName VARCHAR(150), AgeYear INT, OccupationID INT REFERENCES OccupationMaster(OccupationID), ReligionID INT REFERENCES ReligionMaster(ReligionID), CasteID INT REFERENCES CasteMaster(caste_master_id), GenderID INT);
    
    CREATE TABLE ActSectionAssociation (
        CaseMasterID INT REFERENCES CaseMaster(CaseMasterID), 
        ActID VARCHAR(50), 
        SectionID VARCHAR(50), 
        ActOrderID INT, 
        SectionOrderID INT,
        PRIMARY KEY (CaseMasterID, ActID, SectionID),
        FOREIGN KEY (ActID, SectionID) REFERENCES Section(ActCode, SectionCode)
    );
    
    CREATE TABLE Victim (VictimMasterID INT PRIMARY KEY, CaseMasterID INT REFERENCES CaseMaster(CaseMasterID), VictimName VARCHAR(150), AgeYear INT, GenderID INT, VictimPolice VARCHAR(1));
    CREATE TABLE Accused (AccusedMasterID INT PRIMARY KEY, CaseMasterID INT REFERENCES CaseMaster(CaseMasterID), AccusedName VARCHAR(150), AgeYear INT, GenderID INT, PersonID VARCHAR(20));
    CREATE TABLE ArrestSurrender (ArrestSurrenderID INT PRIMARY KEY, CaseMasterID INT REFERENCES CaseMaster(CaseMasterID), ArrestSurrenderTypeID INT, ArrestSurrenderDate DATE, ArrestSurrenderStateId INT REFERENCES State(StateID), ArrestSurrenderDistrictId INT REFERENCES District(DistrictID), PoliceStationID INT REFERENCES Unit(UnitID), IOID INT REFERENCES Employee(EmployeeID), CourtID INT REFERENCES Court(CourtID), AccusedMasterID INT REFERENCES Accused(AccusedMasterID), IsAccused BOOLEAN, IsComplainantAccused BOOLEAN);
    CREATE TABLE inv_arrestsurrenderaccused (ArrestSurrenderID INT REFERENCES ArrestSurrender(ArrestSurrenderID), AccusedMasterID INT REFERENCES Accused(AccusedMasterID), PRIMARY KEY (ArrestSurrenderID, AccusedMasterID));
    CREATE TABLE ChargesheetDetails (CSID INT PRIMARY KEY, CaseMasterID INT REFERENCES CaseMaster(CaseMasterID), csdate TIMESTAMP, cstype CHAR(1), PolicePersonID INT REFERENCES Employee(EmployeeID));
    """
    cur.execute(ddl_create)

    print("🌱 Seeding Master/Lookup tables...")
    master_queries = [
        "INSERT INTO State VALUES (29, 'Karnataka', 1, TRUE);",
        "INSERT INTO UnitType VALUES (1, 'Police Station', 'District', 3, TRUE), (2, 'Circle Office', 'District', 2, TRUE);",
        "INSERT INTO Rank VALUES (1, 'Constable', 5, TRUE), (2, 'Head Constable', 4, TRUE), (3, 'PSI', 3, TRUE), (4, 'PI', 2, TRUE), (5, 'DSP', 1, TRUE);",
        "INSERT INTO Designation VALUES (1, 'Investigating Officer', TRUE, 1), (2, 'Station House Officer', TRUE, 2), (3, 'Writer', TRUE, 3);",
        "INSERT INTO GravityOffence VALUES (1, 'Heinous'), (2, 'Non-Heinous');",
        "INSERT INTO CrimeHead VALUES (1, 'Crimes Against Body', TRUE), (2, 'Crimes Against Property', TRUE), (3, 'Cyber Crimes', TRUE);",
        "INSERT INTO CrimeSubHead VALUES (101, 1, 'Murder', 1), (102, 1, 'Grievous Hurt', 2), (201, 2, 'Theft', 1), (202, 2, 'Robbery', 2), (301, 3, 'Financial Fraud', 1);",
        "INSERT INTO Act VALUES ('IPC', 'Indian Penal Code', 'IPC', TRUE), ('IT_ACT', 'Information Technology Act', 'IT Act', TRUE);",
        "INSERT INTO Section VALUES ('IPC', '302', 'Murder Punishment', TRUE), ('IPC', '379', 'Theft Punishment', TRUE), ('IPC', '324', 'Voluntarily Causing Hurt', TRUE), ('IT_ACT', '66D', 'Cheating by Personation via Computer', TRUE);",
        "INSERT INTO CrimeHeadActSection VALUES (1, 'IPC', '302'), (2, 'IPC', '379'), (3, 'IT_ACT', '66D');",
        "INSERT INTO CasteMaster VALUES (1, 'General'), (2, 'OBC'), (3, 'SC'), (4, 'ST');",
        "INSERT INTO ReligionMaster VALUES (1, 'Hindu'), (2, 'Muslim'), (3, 'Christian'), (4, 'Sikh');",
        "INSERT INTO OccupationMaster VALUES (1, 'Farmer'), (2, 'Business'), (3, 'Private Employee'), (4, 'Government Employee'), (5, 'Unemployed');",
        "INSERT INTO CaseStatusMaster VALUES (1, 'Under Investigation'), (2, 'Charge Sheeted'), (3, 'Closed');"
    ]

    categories = [(1, "FIR"), (3, "UDR"), (4, "PAR"), (8, "Zero FIR")]
    for cid, cval in categories:
        master_queries.append(f"INSERT INTO CaseCategory VALUES ({cid}, '{cval}');")

    for d_id, d_data in KARNATAKA_DISTRICTS.items():
        master_queries.append(f"INSERT INTO District VALUES ({d_id}, '{d_data['name']}', 29, TRUE);")

    units = []
    unit_id_counter = 1001
    for d_id, d_data in KARNATAKA_DISTRICTS.items():
        for ps_suffix in ["Town PS", "Traffic PS"]:
            unit_name = f"{d_data['name'].split()[0]} {ps_suffix}"
            units.append((unit_id_counter, unit_name, d_id))
            master_queries.append(f"INSERT INTO Unit VALUES ({unit_id_counter}, '{unit_name}', 1, NULL, 1, 29, {d_id}, TRUE);")
            unit_id_counter += 1

    employees = []
    emp_id_counter = 5001
    for u_id, u_name, d_id in units:
        for _ in range(3):
            kgid = f"KGID{emp_id_counter}"
            name = generate_name()
            dob = random_date(1975, 1998)
            appoint = random_date(2005, 2020)
            rank = random.choice([1, 2, 3, 4])
            desig = 1 if rank in [3, 4] else 3
            master_queries.append(f"INSERT INTO Employee VALUES ({emp_id_counter}, {d_id}, {u_id}, {rank}, {desig}, '{kgid}', '{name}', '{dob}', {random.choice([1,2])}, 1, FALSE, '{appoint}');")
            employees.append((emp_id_counter, u_id, d_id))
            emp_id_counter += 1

    courts = []
    court_id = 801
    for d_id, d_data in KARNATAKA_DISTRICTS.items():
        c_name = f"District and Sessions Court, {d_data['name'].split()[0]}"
        master_queries.append(f"INSERT INTO Court VALUES ({court_id}, '{c_name}', {d_id}, 29, TRUE);")
        courts.append((court_id, d_id))
        court_id += 1

    for q in master_queries:
        cur.execute(q)

    # ------------------------------------------------------------------------
    # REPEAT OFFENDER POOL (Enables Multi-Case Link Analysis Networks)
    # ------------------------------------------------------------------------
    REPEAT_OFFENDERS = [
        {"name": f"Habitual Suspect {i}", "age": random.randint(22, 48), "gender": 1} 
        for i in range(1, 40)
    ]

    print("⚡ Generating cases and building criminal network linkages...")
    
    running_serials = {}
    complainant_id = 10001
    victim_id = 20001
    accused_id = 30001
    arrest_id = 40001
    cs_id = 50001

    for case_id in range(1, NUM_CASES + 1):
        emp_id, unit_id, district_id = random.choice(employees)
        cat_code, _ = random.choice(categories)
        year = random.choice([2024, 2025, 2026])
        
        serial_key = (cat_code, district_id, unit_id, year)
        running_serials[serial_key] = running_serials.get(serial_key, 0) + 1
        serial_num = running_serials[serial_key]

        crime_no = f"{cat_code}{district_id:04d}{unit_id:04d}{year}{serial_num:05d}"
        case_no = f"{year}{serial_num:05d}"

        crime_date = random_date(year, year)
        inc_from = datetime.datetime.combine(crime_date, datetime.time(random.randint(0, 12), random.randint(0, 59)))
        inc_to = inc_from + datetime.timedelta(hours=random.randint(1, 12))
        info_rcvd = inc_to + datetime.timedelta(hours=random.randint(2, 24))

        gravity_id = random.choice([1, 2])
        if gravity_id == 1:
            major_head = 1
            minor_head = random.choice([101, 102])
            act_code, section_code = 'IPC', random.choice(['302', '324'])
        else:
            major_head = random.choice([2, 3])
            minor_head = 201 if major_head == 2 else 301
            act_code, section_code = ('IPC', '379') if major_head == 2 else ('IT_ACT', '66D')

        status_id = random.choice([1, 2, 3])
        court_id_assigned = next(c[0] for c in courts if c[1] == district_id)

        # Standard decimal coordinates clustered around real district centers
        lat, lon = get_district_lat_lon(district_id)
        fact = random.choice(STREET_FACTS).replace("'", "''")

        # 1. Insert CaseMaster
        cur.execute(f"""
            INSERT INTO CaseMaster VALUES (
                {case_id}, '{crime_no}', '{case_no}', '{crime_date}', {emp_id}, {unit_id}, 
                {cat_code}, {gravity_id}, {major_head}, {minor_head}, {status_id}, {court_id_assigned}, 
                '{inc_from}', '{inc_to}', '{info_rcvd}', {lat}, {lon}, '{fact}'
            );
        """)

        # 2. ComplainantDetails
        comp_name = generate_name()
        cur.execute(f"INSERT INTO ComplainantDetails VALUES ({complainant_id}, {case_id}, '{comp_name}', {random.randint(21, 65)}, {random.randint(1, 5)}, {random.randint(1, 4)}, {random.randint(1, 4)}, {random.choice([1, 2])});")
        complainant_id += 1

        # 3. ActSectionAssociation
        cur.execute(f"INSERT INTO ActSectionAssociation VALUES ({case_id}, '{act_code}', '{section_code}', 1, 1);")

        # 4. Victim
        for _ in range(random.randint(1, 2)):
            cur.execute(f"INSERT INTO Victim VALUES ({victim_id}, {case_id}, '{generate_name()}', {random.randint(18, 70)}, {random.choice([1, 2])}, '{random.choice([0, 0, 0, 1])}');")
            victim_id += 1

        # 5. Accused (35% chance to assign a repeat offender to build network graph connections)
        num_accused = random.randint(1, 3)
        created_accused = []
        for a_idx in range(1, num_accused + 1):
            if random.random() < 0.35:
                offender = random.choice(REPEAT_OFFENDERS)
                a_name = offender["name"]
                a_age = offender["age"]
            else:
                a_name = generate_name()
                a_age = random.randint(19, 55)

            cur.execute(f"INSERT INTO Accused VALUES ({accused_id}, {case_id}, '{a_name}', {a_age}, 1, 'A{a_idx}');")
            created_accused.append(accused_id)
            accused_id += 1

        # 6. ArrestSurrender & Junction table
        if status_id in [2, 3] and created_accused:
            target_accused = random.choice(created_accused)
            cur.execute(f"""
                INSERT INTO ArrestSurrender VALUES (
                    {arrest_id}, {case_id}, 1, '{crime_date + datetime.timedelta(days=random.randint(1, 10))}', 
                    29, {district_id}, {unit_id}, {emp_id}, {court_id_assigned}, {target_accused}, TRUE, FALSE
                );
            """)
            # Junction table insertion
            cur.execute(f"INSERT INTO inv_arrestsurrenderaccused (ArrestSurrenderID, AccusedMasterID) VALUES ({arrest_id}, {target_accused});")
            arrest_id += 1

        # 7. ChargesheetDetails
        if status_id == 2:
            cs_date = info_rcvd + datetime.timedelta(days=random.randint(15, 60))
            cur.execute(f"INSERT INTO ChargesheetDetails VALUES ({cs_id}, {case_id}, '{cs_date}', 'A', {emp_id});")
            cs_id += 1

        if case_id % 500 == 0:
            print(f"✅ Generated {case_id}/{NUM_CASES} cases...")

    # ------------------------------------------------------------------------
    # CREATE MATERIALIZED VIEW (FastAPI Query Acceleration)
    # ------------------------------------------------------------------------
    print("🚀 Creating Materialized View for instant Dashboard performance...")
    cur.execute("""
        CREATE MATERIALIZED VIEW mv_dashboard_analytics AS
        SELECT 
            cm.CaseMasterID,
            cm.CrimeNo,
            cm.CrimeRegisteredDate,
            cm.IncidentFromDate,
            cm.latitude,
            cm.longitude,
            d.DistrictID,
            d.DistrictName,
            u.UnitID,
            u.UnitName AS PoliceStation,
            ch.CrimeHeadID,
            ch.CrimeGroupName AS MajorCrimeType,
            csm.CaseStatusID,
            csm.CaseStatusName
        FROM CaseMaster cm
        LEFT JOIN Unit u ON cm.PoliceStationID = u.UnitID
        LEFT JOIN District d ON u.DistrictID = d.DistrictID
        LEFT JOIN CrimeHead ch ON cm.CrimeMajorHeadID = ch.CrimeHeadID
        LEFT JOIN CaseStatusMaster csm ON cm.CaseStatusID = csm.CaseStatusID;

        CREATE INDEX idx_mv_district ON mv_dashboard_analytics(DistrictID);
        CREATE INDEX idx_mv_registered_date ON mv_dashboard_analytics(CrimeRegisteredDate);
    """)

    # ------------------------------------------------------------------------
    # GENERATE AUTH USER FOR LOGIN
    # ------------------------------------------------------------------------
    print("🔒 Creating NEXUS AuthUser table and Admin Account...")
    cur.execute("""
        CREATE TABLE auth_user (
            id SERIAL PRIMARY KEY,
            EmployeeID INT REFERENCES Employee(EmployeeID) UNIQUE,
            username VARCHAR(50) UNIQUE,
            hashed_password VARCHAR(255),
            role VARCHAR(20)
        );
    """)
    
    # We grab the first employee generated (EmployeeID 5001) to act as our admin
    hashed_pwd = get_password_hash("NexusAdmin2026!")
    cur.execute(f"""
        INSERT INTO auth_user (EmployeeID, username, hashed_password, role) 
        VALUES (5001, 'admin', '{hashed_pwd}', 'admin');
    """)

    conn.commit()
    cur.close()
    conn.close()

    print(f"🎉 Success! Database 'KSP_nexus' is fully populated with {NUM_CASES} cases and ready for FastAPI.")

if __name__ == "__main__":
    generate_and_populate_db()