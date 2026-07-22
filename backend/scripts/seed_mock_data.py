import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.all_models import District, PoliceStation, CrimeCategory, FIR

try:
    from faker import Faker
except ImportError:
    print("❌ Faker is not installed. Please run: pip install faker")
    sys.exit(1)

# Initialize Faker with Indian locale for realistic data
fake = Faker('en_IN')

def seed_mock_data():
    db = SessionLocal()
    try:
        print("⏳ Starting database population...")

        # 1. Check if data already exists to avoid duplication
        if db.query(FIR).count() > 0:
            print("⚠️ Database already contains FIR records. Skipping seed to prevent duplicates.")
            return

        # 2. Create Districts
        print("🌱 Generating Districts...")
        district_names = ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi"]
        districts = []
        for name in district_names:
            d = District(id=uuid.uuid4(), district_name=name, state="Karnataka")
            db.add(d)
            districts.append(d)
        db.commit()

       # 3. Create Police Stations restricted to Karnataka boundaries
        print("🌱 Generating Police Stations within Karnataka...")
        stations = []
        for district in districts:
            # 2 to 4 stations per district
            for _ in range(random.randint(2, 4)):
                station_name = f"{fake.city_name()} Police Station"
                ps = PoliceStation(
                    id=uuid.uuid4(),
                    district_id=district.id,
                    station_name=station_name,
                    # Karnataka Latitude range: ~11.5 to 18.5
                    latitude=round(random.uniform(12.0, 17.5), 6),
                    # Karnataka Longitude range: ~74.0 to 78.5
                    longitude=round(random.uniform(74.5, 78.0), 6)
                )
                db.add(ps)
                stations.append(ps)
        db.commit()

        # 4. Create Crime Categories
        print("🌱 Generating Crime Categories...")
        categories = [
            {"name": "Theft", "ipc": "IPC 378, 379"},
            {"name": "Cybercrime", "ipc": "IT Act Sec 66"},
            {"name": "Assault", "ipc": "IPC 351, 352"},
            {"name": "Fraud", "ipc": "IPC 420"},
            {"name": "Narcotics", "ipc": "NDPS Act"}
        ]
        crime_categories = []
        for cat in categories:
            cc = CrimeCategory(
                id=uuid.uuid4(),
                category_name=cat["name"],
                ipc_sections=cat["ipc"]
            )
            db.add(cc)
            crime_categories.append(cc)
        db.commit()

        # 5. Create FIRs spread over the last 12 months
        print("🌱 Generating 250 FIRs (this may take a moment)...")
        statuses = ["Open", "Under Investigation", "Closed"]
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)

        for _ in range(250):
            # Generate a random registration date within the last year
            random_days = random.randint(0, 365)
            reg_date = start_date + timedelta(days=random_days)
            
            # Incident date is 0-5 days before registration
            inc_date = reg_date - timedelta(days=random.randint(0, 5))

            fir = FIR(
                id=uuid.uuid4(),
                fir_number=f"FIR-{reg_date.year}-{fake.unique.random_int(min=1000, max=9999)}",
                police_station_id=random.choice(stations).id,
                crime_category_id=random.choice(crime_categories).id,
                incident_date=inc_date.date(),
                registration_date=reg_date.date(),
                status=random.choices(statuses, weights=[0.2, 0.5, 0.3])[0], # 20% Open, 50% Investigating, 30% Closed
                summary=fake.text(max_nb_chars=200)
            )
            db.add(fir)

        db.commit()
        print("✅ Mock data generation complete! Generated 250 FIRs.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding mock data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_mock_data()