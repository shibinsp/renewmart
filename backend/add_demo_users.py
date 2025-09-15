from sqlalchemy import text
from database import engine
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def add_demo_users():
    """Add demo users with predefined credentials"""
    conn = engine.connect()
    
    try:
        print("Adding demo users...")
        
        # Demo users data
        demo_users = [
            {
                "email": "landowner@renewmart.com",
                "password": "Land2024!",
                "first_name": "John",
                "last_name": "Landowner",
                "phone": "+1-555-0101",
                "roles": ["landowner"]
            },
            {
                "email": "investor@renewmart.com",
                "password": "Invest2024!",
                "first_name": "Sarah",
                "last_name": "Investor",
                "phone": "+1-555-0102",
                "roles": ["investor"]
            },
            {
                "email": "admin@renewmart.com",
                "password": "Admin2024!",
                "first_name": "Admin",
                "last_name": "User",
                "phone": "+1-555-0103",
                "roles": ["administrator"]
            },
            {
                "email": "sales@renewmart.com",
                "password": "Sales2024!",
                "first_name": "Mike",
                "last_name": "Sales",
                "phone": "+1-555-0104",
                "roles": ["re_sales_advisor"]
            },
            {
                "email": "analyst@renewmart.com",
                "password": "Analyst2024!",
                "first_name": "Emma",
                "last_name": "Analyst",
                "phone": "+1-555-0105",
                "roles": ["re_analyst"]
            },
            {
                "email": "governance@renewmart.com",
                "password": "Gov2024!",
                "first_name": "David",
                "last_name": "Governance",
                "phone": "+1-555-0106",
                "roles": ["re_governance_lead"]
            },
            {
                "email": "manager@renewmart.com",
                "password": "Manager2024!",
                "first_name": "Lisa",
                "last_name": "Manager",
                "phone": "+1-555-0107",
                "roles": ["project_manager"]
            }
        ]
        
        for user_data in demo_users:
            # Hash the password
            hashed_password = hash_password(user_data["password"])
            
            # Insert user
            result = conn.execute(text("""
                INSERT INTO "user" (email, password_hash, first_name, last_name, phone)
                VALUES (:email, :password_hash, :first_name, :last_name, :phone)
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    phone = EXCLUDED.phone,
                    updated_at = now()
                RETURNING user_id
            """), {
                "email": user_data["email"],
                "password_hash": hashed_password,
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "phone": user_data["phone"]
            })
            
            user_id = result.fetchone()[0]
            
            # Assign roles
            for role in user_data["roles"]:
                conn.execute(text("""
                    INSERT INTO user_roles (user_id, role_key)
                    VALUES (:user_id, :role_key)
                    ON CONFLICT DO NOTHING
                """), {
                    "user_id": user_id,
                    "role_key": role
                })
            
            print(f"✓ Added user: {user_data['email']} with roles: {', '.join(user_data['roles'])}")
        
        conn.commit()
        print("\n✅ Successfully added all demo users!")
        
    except Exception as e:
        print(f"❌ Error adding demo users: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    add_demo_users()