from sqlalchemy import text
from database import engine

def create_all_tables():
    """Create all database tables based on database_workflow.txt schema"""
    conn = engine.connect()
    
    try:
        print("Creating database tables...")
        
        # Enable extensions
        print("Enabling PostgreSQL extensions...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gin"))
        
        # 1) Lookup Tables
        print("Creating lookup tables...")
        
        # lu_roles table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lu_roles (
                role_key TEXT PRIMARY KEY,
                label TEXT NOT NULL
            )
        """))
        
        # lu_status table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lu_status (
                status_key TEXT PRIMARY KEY,
                scope TEXT NOT NULL
            )
        """))
        
        # lu_task_status table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lu_task_status (
                status_key TEXT PRIMARY KEY
            )
        """))
        
        # lu_energy_type table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lu_energy_type (
                energy_key TEXT PRIMARY KEY
            )
        """))
        
        # 2) Users & RBAC
        print("Creating users and roles tables...")
        
        # users table (quoted because 'user' is reserved keyword)
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "user" (
                user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        """))
        
        # user_roles table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_roles (
                user_id UUID REFERENCES "user"(user_id) ON DELETE CASCADE,
                role_key TEXT REFERENCES lu_roles(role_key),
                assigned_at TIMESTAMPTZ DEFAULT now(),
                PRIMARY KEY(user_id, role_key)
            )
        """))
        
        # 3) Section definitions
        print("Creating section definitions...")
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS section_definitions (
                section_key TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                default_role_reviewer TEXT REFERENCES lu_roles(role_key)
            )
        """))
        
        # 4) Land, Sections, Documents
        print("Creating land-related tables...")
        
        # lands table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS lands (
                land_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                landowner_id UUID NOT NULL REFERENCES "user"(user_id),
                title TEXT NOT NULL,
                location_text TEXT,
                coordinates JSONB,
                area_acres NUMERIC(10,2),
                land_type TEXT,
                status TEXT NOT NULL DEFAULT 'draft' REFERENCES lu_status(status_key),
                admin_notes TEXT,
                energy_key TEXT REFERENCES lu_energy_type(energy_key),
                capacity_mw NUMERIC(12,2),
                price_per_mwh NUMERIC(12,2),
                timeline_text TEXT,
                contract_term_years INT,
                developer_name TEXT,
                published_at TIMESTAMPTZ,
                interest_locked_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        """))
        
        # land_sections table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS land_sections (
                land_section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                land_id UUID NOT NULL REFERENCES lands(land_id) ON DELETE CASCADE,
                section_key TEXT NOT NULL REFERENCES section_definitions(section_key),
                status TEXT NOT NULL DEFAULT 'draft' REFERENCES lu_status(status_key),
                assigned_role TEXT REFERENCES lu_roles(role_key),
                assigned_user UUID REFERENCES "user"(user_id),
                data JSONB,
                reviewer_comments TEXT,
                submitted_at TIMESTAMPTZ,
                approved_at TIMESTAMPTZ,
                rejected_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                UNIQUE(land_id, section_key)
            )
        """))
        
        # documents table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS documents (
                document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                land_id UUID REFERENCES lands(land_id) ON DELETE CASCADE,
                land_section_id UUID REFERENCES land_sections(land_section_id) ON DELETE CASCADE,
                uploaded_by UUID REFERENCES "user"(user_id),
                document_type TEXT,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size BIGINT,
                mime_type TEXT,
                is_draft BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """))
        
        # 5) Tasks and History
        print("Creating task-related tables...")
        
        # tasks table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tasks (
                task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                land_id UUID NOT NULL REFERENCES lands(land_id) ON DELETE CASCADE,
                land_section_id UUID REFERENCES land_sections(land_section_id) ON DELETE SET NULL,
                title TEXT NOT NULL,
                description TEXT,
                assigned_role TEXT REFERENCES lu_roles(role_key),
                assigned_to UUID REFERENCES "user"(user_id),
                status TEXT NOT NULL DEFAULT 'assigned' REFERENCES lu_task_status(status_key),
                priority TEXT DEFAULT 'medium',
                start_date DATE,
                end_date DATE,
                created_by UUID REFERENCES "user"(user_id),
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            )
        """))
        
        # task_history table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS task_history (
                history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
                changed_by UUID REFERENCES "user"(user_id),
                from_status TEXT REFERENCES lu_task_status(status_key),
                to_status TEXT REFERENCES lu_task_status(status_key),
                start_ts TIMESTAMPTZ DEFAULT now(),
                end_ts TIMESTAMPTZ,
                note TEXT
            )
        """))
        
        # 6) Investor Interests
        print("Creating investor interests table...")
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS investor_interests (
                interest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                investor_id UUID NOT NULL REFERENCES "user"(user_id),
                land_id UUID NOT NULL REFERENCES lands(land_id) ON DELETE CASCADE,
                status TEXT NOT NULL DEFAULT 'submitted',
                comments TEXT,
                created_at TIMESTAMPTZ DEFAULT now(),
                UNIQUE(investor_id, land_id)
            )
        """))
        
        # Create Indexes
        print("Creating indexes...")
        
        indexes = [
            'CREATE INDEX IF NOT EXISTS idx_lands_owner ON lands(landowner_id)',
            'CREATE INDEX IF NOT EXISTS idx_lands_status ON lands(status)',
            'CREATE INDEX IF NOT EXISTS idx_lands_published ON lands(published_at) WHERE published_at IS NOT NULL',
            'CREATE INDEX IF NOT EXISTS idx_lands_energy ON lands(energy_key)',
            'CREATE INDEX IF NOT EXISTS idx_land_sections_land ON land_sections(land_id)',
            'CREATE INDEX IF NOT EXISTS idx_land_sections_status ON land_sections(status)',
            'CREATE INDEX IF NOT EXISTS idx_sections_assignee ON land_sections(assigned_user)',
            'CREATE INDEX IF NOT EXISTS idx_sections_role ON land_sections(assigned_role)',
            'CREATE INDEX IF NOT EXISTS idx_docs_land ON documents(land_id)',
            'CREATE INDEX IF NOT EXISTS idx_docs_section ON documents(land_section_id)',
            'CREATE INDEX IF NOT EXISTS idx_docs_uploader ON documents(uploaded_by)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_land ON tasks(land_id)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
            'CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(task_id)',
            'CREATE INDEX IF NOT EXISTS idx_task_history_period ON task_history(start_ts, end_ts)',
            'CREATE INDEX IF NOT EXISTS idx_interest_land ON investor_interests(land_id)'
        ]
        
        for index_sql in indexes:
            try:
                conn.execute(text(index_sql))
            except Exception as e:
                print(f"Index creation warning: {e}")
                continue
        
        # Create Triggers and Functions
        print("Creating triggers and functions...")
        
        # Updated timestamp trigger function
        conn.execute(text("""
            CREATE OR REPLACE FUNCTION trg_touch_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at := now();
                RETURN NEW;
            END; $$ LANGUAGE plpgsql
        """))
        
        # Create triggers for updated_at
        trigger_tables = ['lands', 'land_sections', 'tasks']
        for table in trigger_tables:
            try:
                conn.execute(text(f"""
                    DROP TRIGGER IF EXISTS trg_touch_{table} ON {table};
                    CREATE TRIGGER trg_touch_{table} BEFORE UPDATE ON {table}
                    FOR EACH ROW EXECUTE FUNCTION trg_touch_updated_at()
                """))
            except Exception as e:
                print(f"Trigger creation warning for {table}: {e}")
                continue
        
        # Task creation guard function
        conn.execute(text("""
            CREATE OR REPLACE FUNCTION check_tasks_only_after_submit()
            RETURNS TRIGGER AS $$
            DECLARE l_status TEXT;
            BEGIN
                SELECT status INTO l_status FROM lands WHERE land_id = NEW.land_id;
                IF l_status IN ('draft') THEN
                    RAISE EXCEPTION 'Tasks cannot be created while land is in DRAFT.';
                END IF;
                RETURN NEW;
            END; $$ LANGUAGE plpgsql
        """))
        
        try:
            conn.execute(text("""
                DROP TRIGGER IF EXISTS trg_tasks_after_submit ON tasks;
                CREATE TRIGGER trg_tasks_after_submit
                BEFORE INSERT ON tasks
                FOR EACH ROW EXECUTE FUNCTION check_tasks_only_after_submit()
            """))
        except Exception as e:
            print(f"Task trigger creation warning: {e}")
        
        # Task history logging function
        conn.execute(text("""
            CREATE OR REPLACE FUNCTION log_task_history()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP='INSERT' THEN
                    INSERT INTO task_history(task_id, changed_by, from_status, to_status, start_ts, note)
                    VALUES (NEW.task_id, NEW.created_by, NULL, NEW.status, now(), 'task created');
                    RETURN NEW;
                ELSIF TG_OP='UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
                    UPDATE task_history
                        SET end_ts = now()
                        WHERE task_id = NEW.task_id AND end_ts IS NULL;
                    INSERT INTO task_history(task_id, changed_by, from_status, to_status, start_ts)
                    VALUES (NEW.task_id, NEW.created_by, OLD.status, NEW.status, now());
                    RETURN NEW;
                END IF;
                RETURN NEW;
            END; $$ LANGUAGE plpgsql
        """))
        
        try:
            conn.execute(text("""
                DROP TRIGGER IF EXISTS trg_task_history_insert ON tasks;
                CREATE TRIGGER trg_task_history_insert
                AFTER INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_history()
            """))
        except Exception as e:
            print(f"Task history insert trigger warning: {e}")
        
        try:
            conn.execute(text("""
                DROP TRIGGER IF EXISTS trg_task_history_update ON tasks;
                CREATE TRIGGER trg_task_history_update
                AFTER UPDATE OF status ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_history()
            """))
        except Exception as e:
            print(f"Task history update trigger warning: {e}")
        
        # Insert seed data
        print("Inserting seed data...")
        
        # Seed lu_roles
        conn.execute(text("""
            INSERT INTO lu_roles(role_key, label) VALUES
            ('landowner','Landowner'),
            ('investor','Investor'),
            ('re_sales_advisor','RE Sales Advisor'),
            ('re_analyst','RE Analyst'),
            ('re_governance_lead','RE Governance Lead'),
            ('administrator','Administrator'),
            ('project_manager','Project Manager')
            ON CONFLICT DO NOTHING
        """))
        
        # Seed lu_status
        conn.execute(text("""
            INSERT INTO lu_status(status_key, scope) VALUES
            ('draft','land'),('submitted','land'),('under_review','land'),('approved','land'),
            ('rejected','land'),('investor_ready','land'),('published','land'),
            ('interest_locked','land'),('rtb','land'),('complete','land'),
            ('assigned','task'),('in_progress','task'),('pending','task'),('delayed','task'),
            ('completed','task'),('rejected','task'),('on_hold','task'),
            ('draft','section'),('submitted','section'),('approved','section'),('rejected','section')
            ON CONFLICT DO NOTHING
        """))
        
        # Seed lu_task_status
        conn.execute(text("""
            INSERT INTO lu_task_status(status_key) VALUES
            ('assigned'),('in_progress'),('pending'),('delayed'),('completed'),('rejected'),('on_hold')
            ON CONFLICT DO NOTHING
        """))
        
        # Seed lu_energy_type
        conn.execute(text("""
            INSERT INTO lu_energy_type(energy_key) VALUES
            ('solar'),('wind'),('hydroelectric'),('biomass'),('geothermal')
            ON CONFLICT DO NOTHING
        """))
        
        # Seed section_definitions
        conn.execute(text("""
            INSERT INTO section_definitions(section_key, label, default_role_reviewer) VALUES
            ('ownership','Ownership & Title','re_governance_lead'),
            ('site','Site Characteristics','re_analyst'),
            ('grid','Grid & Interconnection','re_analyst'),
            ('environment','Environmental & Permits','re_governance_lead'),
            ('commercial','Commercial / Lease / PPA','re_sales_advisor')
            ON CONFLICT DO NOTHING
        """))
        
        # Create investor listings view
        print("Creating views...")
        conn.execute(text("""
            CREATE OR REPLACE VIEW vw_investor_listings AS
            SELECT
                land_id,
                title,
                location_text,
                capacity_mw,
                price_per_mwh,
                timeline_text,
                contract_term_years,
                developer_name,
                energy_key
            FROM lands
            WHERE status='published'
        """))
        
        conn.commit()
        print("\n✅ Successfully created all 13 tables with indexes, triggers, and seed data!")
        
        # Verify tables were created
        result = conn.execute(text("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        """))
        
        tables = result.fetchall()
        print(f"\n📊 Created {len(tables)} tables:")
        for table in tables:
            print(f"  ✓ {table[0]}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    create_all_tables()