import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseUpload() {
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  console.log('Uploading with decode: true...');
  const res = await supabase.storage.from('avatars').upload('test/decode.png', base64Data, {
    contentType: 'image/png',
    upsert: true,
    decode: true
  });
  console.log('Result:', res.error ? res.error.message : 'Success!');
}
testSupabaseUpload();
