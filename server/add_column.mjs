import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function alterTable() {
  const { error } = await supabase.rpc('execute_sql', { sql_string: "ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;" });
  if (error) {
    console.log('RPC failed, trying raw insert to test if it exists:', error.message);
  } else {
    console.log('Column added or already exists');
  }
}
alterTable();
