import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error fetching buckets:', error);
  } else {
    console.log('Buckets:', data.map(b => b.name));
    
    // Create missing ones
    const required = ['avatars', 'payment_proofs', 'chat-media'];
    for (const b of required) {
      if (!data.some(existing => existing.name === b)) {
        console.log(`Creating bucket ${b}...`);
        await supabase.storage.createBucket(b, { public: true });
      }
    }
  }
}
checkBuckets();
