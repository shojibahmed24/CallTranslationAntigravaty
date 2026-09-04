import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucketLimit() {
  const { data, error } = await supabase.storage.getBucket('avatars');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Bucket details:', data);
  }
}
checkBucketLimit();
