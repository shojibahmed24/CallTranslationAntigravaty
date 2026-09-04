import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL for automated migration.");

    // Adding missing columns to users table
    const alterUsersSql = `
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
      ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS translated_minutes_used_today NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS translated_minutes_used_month NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT '{"lastSeen": "everyone", "profilePhoto": "everyone", "readReceipts": true, "allowUnknownCalls": true}'::jsonb,
      ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'offline';
    `;

    console.log("Running ALTER TABLE on users...");
    await client.query(alterUsersSql);
    console.log("✅ Missing columns added to users table successfully!");

  } catch (err) {
    console.error("❌ Automated Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
