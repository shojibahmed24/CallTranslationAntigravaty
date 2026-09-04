import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './server/src/config/index.js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStuckCalls() {
  const { data, error } = await supabase
    .from('calls')
    .update({ status: 'completed' })
    .in('status', ['initiating', 'in_progress']);
    
  if (error) console.error('Error:', error);
  else console.log('Successfully cleared all stuck calls!');
}

fixStuckCalls();
