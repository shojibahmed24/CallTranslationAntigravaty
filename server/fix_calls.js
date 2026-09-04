import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStuckCalls() {
  const { data, error } = await supabase
    .from('calls')
    .update({ status: 'completed' })
    .in('status', ['initiating', 'in_progress'])
    .select();
    
  if (error) console.error('Error:', error);
  else console.log('Successfully cleared all stuck calls! Count:', data?.length);
}

fixStuckCalls();
