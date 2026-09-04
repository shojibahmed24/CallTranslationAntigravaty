import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearCalls() {
  const { data, error } = await supabase
    .from('calls')
    .update({ status: 'completed' })
    .in('status', ['initiating', 'in_progress'])
    .select('id');
    
  if (error) {
    console.error('Error clearing calls:', error);
  } else {
    console.log(`Cleared ${data.length} stuck calls.`);
  }
}

clearCalls();
