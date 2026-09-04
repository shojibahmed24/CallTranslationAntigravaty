import pg from 'pg';
import fs from 'fs';

const connectionString = 'postgresql://postgres:JibOn%40786400@db.kxkabnahclcsitfkllvg.supabase.co:5432/postgres';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('C:/Users/rajsh/.gemini/antigravity/brain/9c0af05e-1218-43a3-8c24-27517d324fff/supabase_storage_buckets.sql', 'utf8');
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully!');
    await client.query(sql);
    console.log('Migration executed successfully!');
    client.release();
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
