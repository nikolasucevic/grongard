# Supabase Database Dump and Restore Tutorial

## Part 1: Dumping Your Supabase Database

### Prerequisites
- Supabase CLI installed in your project
- Access to your Supabase project

### Steps

1. **Navigate to your project directory**
   ```
   cd /path/to/your/project
   ```

2. **Initialize Supabase in your project** (if not already done)
   ```
   npx supabase init
   ```

3. **Login to your Supabase account**
   ```
   npx supabase login
   ```

4. **Link your local project to your remote Supabase project**
   ```
   npx supabase link --project-ref pvybxfvyomvgwejttuzw
   ```
   Replace `pvybxfvyomvgwejttuzw` with your actual project reference.

5. **Dump your database**
   
   For schema only:
   ```
   npx supabase db dump --file=mydbdump_schema.sql
   ```

   For both schema and data:
   ```
   npx supabase db dump --file=mydbdump_with_data.sql
   ```

   For data only:
   ```
   npx supabase db dump --file=mydbdump_data.sql --data-only
   ```

   Additional options:
   - To exclude tables: `-x public.table1,public.table2`
   - To include specific schemas: `-s public,custom_schema`

## Part 2: Recreating Your Database from a Dump

### Prerequisites
- Access to target database (local or remote)
- SQL dump file (e.g., `mydbdump_with_data.sql`)

### Steps

1. **For a local Supabase instance:**
   
   Reset the database:
   ```
   npx supabase db reset --db-url postgresql://postgres:your_password@localhost:54322/postgres
   ```
   
   Restore the dump:
   ```
   psql postgresql://postgres:your_password@localhost:54322/postgres -f mydbdump_with_data.sql
   ```

2. **For a remote Supabase instance:**
   
   Reset the database (caution: this will delete existing data):
   ```
   npx supabase db reset
   ```
   
   Restore the dump:
   ```
   psql -h pvybxfvyomvgwejttuzw.supabase.co -U postgres -d postgres -f mydbdump_with_data.sql
   ```

3. **If you encounter permissions issues:**
   
   Connect to the `supabase_admin` database:
   ```
   psql -h pvybxfvyomvgwejttuzw.supabase.co -U postgres -d supabase_admin
   ```
   
   Then, within the psql console:
   ```sql
   \i mydbdump_with_data.sql
   ```

### Important Notes
- Always backup your data before performing a restore operation.
- Restoring a dump can overwrite existing data in the target database.
- You might need to handle roles and permissions separately, as Supabase manages some roles automatically.
- When dumping and restoring data, be aware of any foreign key constraints or dependencies between tables.
- Large datasets may take a significant amount of time to dump and restore.

Remember to replace `your_password` and `pvybxfvyomvgwejttuzw` with your actual database password and project reference.
