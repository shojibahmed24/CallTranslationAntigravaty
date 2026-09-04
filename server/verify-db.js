import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function checkDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Checking tables via REST API...");
  
  const tables = ['users', 'chats', 'messages', 'settings'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`- Table '${table}' check failed:`, error.message);
    } else {
      console.log(`- Table '${table}' exists and is queryable!`);
    }
  }
}

checkDatabase();
