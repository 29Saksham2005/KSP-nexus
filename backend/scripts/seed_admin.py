import sys
import os
import uuid

# Add the backend directory to the Python path so we can import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.all_models import Role, User
from app.core.security import get_password_hash

def seed_admin():
    print("⏳ Initializing database tables...")
    # This creates all tables defined in all_models.py
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Check if Administrator role exists, if not, create it
        admin_role = db.query(Role).filter(Role.role_name == "Administrator").first()
        if not admin_role:
            print("🌱 Creating 'Administrator' role...")
            admin_role = Role(
                id=uuid.uuid4(),
                role_name="Administrator",
                description="Full system access across all KSP NEXUS modules."
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        # 2. Check if admin user exists, if not, create them
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("🌱 Creating 'admin' user...")
            hashed_password = get_password_hash("NexusAdmin2026!") # Default password
            
            admin_user = User(
                id=uuid.uuid4(),
                username="admin",
                password_hash=hashed_password,
                full_name="System Administrator",
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully!")
            print("   Username: admin")
            print("   Password: NexusAdmin2026!")
        else:
            print("⚠️ Admin user already exists. Skipping creation.")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()
        print("Done.")

if __name__ == "__main__":
    seed_admin()