#!/usr/bin/env python3
"""
Database table creation script for Renewmart
This script creates all the necessary tables based on the database schema
"""

import os
import sys
import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import engine, Base
from models import *  # Import all models

def create_lookup_data(session):
    """Insert initial lookup data"""
    
    # Insert roles
    roles_data = [
        ('administrator', 'Administrator'),
        ('landowner', 'Land Owner'),
        ('investor', 'Investor'),
        ('reviewer', 'Reviewer'),
        ('engineer', 'Engineer'),
        ('environmental_specialist', 'Environmental Specialist'),
        ('legal_advisor', 'Legal Advisor')
    ]
    
    for role_key, role_name in roles_data:
        session.execute(text("""
            INSERT INTO lu_roles (role_key, label) 
            VALUES (:role_key, :label)
            ON CONFLICT (role_key) DO NOTHING
        """), {'role_key': role_key, 'label': role_name})
    
    # Insert statuses
    statuses_data = [
        ('draft', 'land'),
        ('submitted', 'land'),
        ('under_review', 'land'),
        ('approved', 'land'),
        ('rejected', 'land'),
        ('published', 'land'),
        ('ready_to_build', 'land'),
        ('interested', 'investor_interest'),
        ('withdrawn', 'investor_interest')
    ]
    
    for status_key, scope in statuses_data:
        session.execute(text("""
            INSERT INTO lu_status (status_key, scope) 
            VALUES (:status_key, :scope)
            ON CONFLICT (status_key) DO NOTHING
        """), {'status_key': status_key, 'scope': scope})
    
    # Insert task statuses
    task_statuses_data = [
        'assigned', 'in_progress', 'pending', 'delayed', 'completed', 'rejected', 'on_hold'
    ]
    
    for status_key in task_statuses_data:
        session.execute(text("""
            INSERT INTO lu_task_status (status_key)
            VALUES (:status_key)
            ON CONFLICT (status_key) DO NOTHING
        """), {'status_key': status_key})
    
    # Insert energy types
    energy_types_data = [
        'solar', 'wind', 'hydroelectric', 'biomass', 'geothermal'
    ]
    
    for energy_key in energy_types_data:
        session.execute(text("""
            INSERT INTO lu_energy_type (energy_key)
            VALUES (:energy_key)
            ON CONFLICT (energy_key) DO NOTHING
        """), {'energy_key': energy_key})
    
    # Insert section definitions (accordion sections)
    section_definitions_data = [
        ('basic_info', 'Basic Information', 'Basic land and project information', 1),
        ('location_details', 'Location Details', 'Detailed location and geographic information', 2),
        ('technical_specs', 'Technical Specifications', 'Technical requirements and specifications', 3),
        ('environmental', 'Environmental Assessment', 'Environmental impact and assessments', 4),
        ('legal_permits', 'Legal & Permits', 'Legal documentation and permits', 5),
        ('financial', 'Financial Information', 'Financial details and projections', 6),
        ('utilities', 'Utilities & Infrastructure', 'Utility connections and infrastructure', 7),
        ('timeline', 'Project Timeline', 'Development timeline and milestones', 8),
        ('documentation', 'Supporting Documents', 'Additional supporting documentation', 9)
    ]
    
    for section_key, section_name, description, display_order in section_definitions_data:
        session.execute(text("""
            INSERT INTO section_definitions (section_key, label, default_role_reviewer) 
            VALUES (:section_key, :label, :default_role_reviewer)
            ON CONFLICT (section_key) DO NOTHING
        """), {
            'section_key': section_key, 
            'label': section_name, 
            'default_role_reviewer': None
        })
    
    session.commit()
    print("✓ Lookup data inserted successfully")

def create_triggers_and_functions(session):
    """Create database triggers and functions"""
    
    # Function to update updated_at timestamp
    session.execute(text("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """))
    
    # Triggers for updated_at columns
    tables_with_updated_at = [
        'users', 'user_roles', 'land', 'land_section', 'document', 
        'task', 'task_history', 'investor_interest'
    ]
    
    for table in tables_with_updated_at:
        session.execute(text(f"""
            DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table};
            CREATE TRIGGER update_{table}_updated_at
                BEFORE UPDATE ON {table}
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        """))
    
    # Function to create land sections when a land is created
    session.execute(text("""
        CREATE OR REPLACE FUNCTION create_land_sections()
        RETURNS TRIGGER AS $$
        DECLARE
            section_def RECORD;
        BEGIN
            -- Create sections for each section definition
            FOR section_def IN SELECT section_key FROM section_definition ORDER BY display_order
            LOOP
                INSERT INTO land_section (land_id, section_key, status, data)
                VALUES (NEW.land_id, section_def.section_key, 'draft', '{}');
            END LOOP;
            
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """))
    
    # Trigger to create land sections
    session.execute(text("""
        DROP TRIGGER IF EXISTS create_land_sections_trigger ON land;
        CREATE TRIGGER create_land_sections_trigger
            AFTER INSERT ON land
            FOR EACH ROW
            EXECUTE FUNCTION create_land_sections();
    """))
    
    session.commit()
    print("✓ Database triggers and functions created successfully")

def create_admin_user(session):
    """Create default admin user"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Check if admin user already exists
    result = session.execute(text("""
        SELECT user_id FROM users WHERE email = 'admin@renewmart.com'
    """)).fetchone()
    
    if not result:
        # Create admin user
        hashed_password = pwd_context.hash("admin123")
        
        admin_user_id = str(uuid.uuid4())
        session.execute(text("""
            INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone, is_active)
            VALUES (:user_id, 'admin@renewmart.com', :password_hash, 'System', 'Administrator', '+1234567890', true)
        """), {'user_id': admin_user_id, 'password_hash': hashed_password})
        
        # Use the generated user ID
        user_id = admin_user_id
        
        # Assign administrator role
        session.execute(text("""
            INSERT INTO user_roles (user_id, role_key)
            VALUES (:user_id, 'administrator')
        """), {'user_id': user_id})

        session.commit()
        print("✓ Admin user created successfully")
        print("  Email: admin@renewmart.com")
        print("  Password: admin123")
        print("  Please change the password after first login!")
    else:
        print("✓ Admin user already exists")

def main():
    """Main function to create all database tables and initial data"""
    print("Creating Renewmart database tables...")
    
    try:
        # Create all tables
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        
        try:
            # Insert lookup data
            print("\nInserting lookup data...")
            create_lookup_data(session)
            
            # Create triggers and functions
            print("\nCreating database triggers and functions...")
            create_triggers_and_functions(session)
            
            # Create admin user
            print("\nCreating admin user...")
            create_admin_user(session)
            
            print("\n🎉 Database setup completed successfully!")
            print("\nYou can now start the FastAPI server with:")
            print("  python -m uvicorn main:app --reload")
            
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
            
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()