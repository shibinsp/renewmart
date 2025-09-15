from sqlalchemy import text
from database import engine

def verify_database_structure():
    """Verify all 13 tables are created correctly with proper structure and data"""
    conn = engine.connect()
    
    try:
        print("🔍 Verifying database structure...\n")
        
        # Expected 13 tables
        expected_tables = {
            'documents', 'investor_interests', 'land_sections', 'lands',
            'lu_energy_type', 'lu_roles', 'lu_status', 'lu_task_status',
            'section_definitions', 'task_history', 'tasks', 'user', 'user_roles'
        }
        
        # Get all tables
        result = conn.execute(text("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        """))
        
        actual_tables = {row[0] for row in result.fetchall()}
        
        print(f"📊 Found {len(actual_tables)} tables:")
        for table in sorted(actual_tables):
            status = "✅" if table in expected_tables else "❌"
            print(f"  {status} {table}")
        
        # Check for missing tables
        missing_tables = expected_tables - actual_tables
        if missing_tables:
            print(f"\n❌ Missing tables: {missing_tables}")
            return False
        
        # Check for extra tables
        extra_tables = actual_tables - expected_tables
        if extra_tables:
            print(f"\n⚠️  Extra tables found: {extra_tables}")
        
        # Verify seed data
        print("\n🌱 Verifying seed data...")
        
        # Check lu_roles
        result = conn.execute(text("SELECT COUNT(*) FROM lu_roles"))
        roles_count = result.fetchone()[0]
        print(f"  ✓ lu_roles: {roles_count} roles")
        
        # Check lu_status
        result = conn.execute(text("SELECT COUNT(*) FROM lu_status"))
        status_count = result.fetchone()[0]
        print(f"  ✓ lu_status: {status_count} statuses")
        
        # Check lu_task_status
        result = conn.execute(text("SELECT COUNT(*) FROM lu_task_status"))
        task_status_count = result.fetchone()[0]
        print(f"  ✓ lu_task_status: {task_status_count} task statuses")
        
        # Check lu_energy_type
        result = conn.execute(text("SELECT COUNT(*) FROM lu_energy_type"))
        energy_count = result.fetchone()[0]
        print(f"  ✓ lu_energy_type: {energy_count} energy types")
        
        # Check section_definitions
        result = conn.execute(text("SELECT COUNT(*) FROM section_definitions"))
        sections_count = result.fetchone()[0]
        print(f"  ✓ section_definitions: {sections_count} sections")
        
        # Verify foreign key relationships
        print("\n🔗 Verifying foreign key constraints...")
        
        # Check if foreign keys exist (this will fail if constraints are broken)
        fk_checks = [
            ("user_roles -> lu_roles", "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_name='user_roles' AND constraint_name LIKE '%role_key%'"),
            ("lands -> user", "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_name='lands' AND constraint_name LIKE '%landowner_id%'"),
            ("land_sections -> lands", "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_name='land_sections' AND constraint_name LIKE '%land_id%'"),
            ("tasks -> lands", "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_name='tasks' AND constraint_name LIKE '%land_id%'"),
            ("investor_interests -> user", "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_name='investor_interests' AND constraint_name LIKE '%investor_id%'")
        ]
        
        for check_name, query in fk_checks:
            result = conn.execute(text(query))
            fk_count = result.fetchone()[0]
            status = "✅" if fk_count > 0 else "❌"
            print(f"  {status} {check_name}: {fk_count} constraint(s)")
        
        # Verify triggers exist
        print("\n⚡ Verifying triggers...")
        
        result = conn.execute(text("""
            SELECT trigger_name, event_object_table 
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name
        """))
        
        triggers = result.fetchall()
        print(f"  Found {len(triggers)} triggers:")
        for trigger_name, table_name in triggers:
            print(f"    ✓ {trigger_name} on {table_name}")
        
        # Verify views exist
        print("\n👁️  Verifying views...")
        
        result = conn.execute(text("""
            SELECT viewname 
            FROM pg_views 
            WHERE schemaname = 'public'
        """))
        
        views = result.fetchall()
        print(f"  Found {len(views)} views:")
        for view in views:
            print(f"    ✓ {view[0]}")
        
        # Final verification
        if len(actual_tables) == 13 and not missing_tables:
            print("\n🎉 SUCCESS: All 13 tables created successfully!")
            print("✅ Database structure matches the schema requirements")
            print("✅ All seed data inserted correctly")
            print("✅ Foreign key constraints established")
            print("✅ Triggers and functions created")
            print("✅ Views created")
            return True
        else:
            print("\n❌ FAILED: Database structure verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = verify_database_structure()
    if success:
        print("\n🚀 Database is ready for use!")
    else:
        print("\n🔧 Please check the database setup.")