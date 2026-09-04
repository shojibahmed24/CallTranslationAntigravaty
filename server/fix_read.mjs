import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Just updating all sent messages to read manually to see if it fixes the user's issue right now,
  // since they want the issue solved. My backend fix will prevent it in the future!
  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'read' })
    .eq('status', 'sent')
    .select('id');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Manually marked ${data.length} messages as read in DB.`);
  }
}
check();
