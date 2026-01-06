/**
 * PostgreSQL Setup Guide
 * Instructions for creating database and user
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║         PostgreSQL Setup Instructions                      ║
╚════════════════════════════════════════════════════════════╝

⚠️  IMPORTANT: Database and user creation failed

To set up the database manually, follow these steps:

STEP 1: Connect to PostgreSQL as admin
─────────────────────────────────────────────────────────────
Run this command in Command Prompt or PowerShell:

  psql -U postgres

(If prompts for password, it might be blank or your admin password)


STEP 2: Create the database
─────────────────────────────────────────────────────────────
Once connected to psql, run these commands:

  CREATE DATABASE "Project_2";


STEP 3: Create the user
─────────────────────────────────────────────────────────────
  CREATE USER "user" WITH PASSWORD 'Swapnil@2102';

  ALTER ROLE "user" CREATEDB;

  GRANT ALL PRIVILEGES ON DATABASE "Project_2" TO "user";


STEP 4: Connect to Project_2 database
─────────────────────────────────────────────────────────────
  \\c "Project_2"


STEP 5: Grant schema privileges
─────────────────────────────────────────────────────────────
  GRANT ALL ON SCHEMA public TO "user";

  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";


STEP 6: Verify the connection (exit psql first)
─────────────────────────────────────────────────────────────
Exit psql by typing: \\q

Then test connection with:

  psql -h localhost -U user -d "Project_2"

When prompted for password, enter: Swapnil@2102


STEP 7: Create tables
─────────────────────────────────────────────────────────────
Once verified, run this to create all tables:

  npm run init-db


═══════════════════════════════════════════════════════════════

QUICK REFERENCE - All commands to run in psql:
─────────────────────────────────────────────────────────────

CREATE DATABASE "Project_2";
CREATE USER "user" WITH PASSWORD 'Swapnil@2102';
ALTER ROLE "user" CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE "Project_2" TO "user";
\\c "Project_2"
GRANT ALL ON SCHEMA public TO "user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "user";

═══════════════════════════════════════════════════════════════

TROUBLESHOOTING:
─────────────────────────────────────────────────────────────

If PostgreSQL is not installed:
  1. Download PostgreSQL from: https://www.postgresql.org/download/
  2. Install with default settings
  3. Remember the password for 'postgres' user
  4. Follow steps above

If psql command not found:
  1. Add PostgreSQL bin folder to PATH:
     Default: C:\\Program Files\\PostgreSQL\\15\\bin\\
  2. Restart Command Prompt or PowerShell
  3. Try again

If password authentication fails:
  1. Check if user "user" actually exists: \\du (in psql)
  2. Check password is correct: 'Swapnil@2102'
  3. Check database "Project_2" exists: \\l (in psql)

═══════════════════════════════════════════════════════════════
`);

console.log('\n✓ Setup guide displayed above');
console.log('✓ Once database is created, run: npm run init-db\n');
