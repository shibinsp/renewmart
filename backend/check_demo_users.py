from database import engine
from sqlalchemy import text

def check_demo_users():
    """Check if demo users exist in database"""
    conn = engine.connect()
    
    try:
        result = conn.execute(text("""
            SELECT u.email, u.first_name, u.last_name, 
                   array_agg(ur.role_key) as roles
            FROM "user" u
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id
            WHERE u.email IN ('landowner@renewmart.com', 'investor@renewmart.com', 'admin@renewmart.com')
            GROUP BY u.email, u.first_name, u.last_name
            ORDER BY u.email
        """))
        
        print("Demo users in database:")
        for row in result:
            roles = ', '.join(row[3]) if row[3] and row[3][0] else 'No roles'
            print(f"- {row[0]}: {row[1]} {row[2]} (Roles: {roles})")
            
    except Exception as e:
        print(f"Error checking demo users: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_demo_users()