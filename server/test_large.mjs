import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLargeUpload() {
  const randomBytes = crypto.randomBytes(1819710); // 1.8MB
  const base64Data = randomBytes.toString('base64');
  
  // 1. Buffer
  const buffer = Buffer.from(base64Data, 'base64');
  let res = await supabase.storage.from('avatars').upload('test/large_buffer.jpg', buffer, { contentType: 'image/jpeg', upsert: true });
  console.log('Buffer Upload:', res.error ? res.error.message : 'OK');
  
  // 2. decode: true
  res = await supabase.storage.from('avatars').upload('test/large_decode.jpg', base64Data, { contentType: 'image/jpeg', upsert: true, decode: true });
  console.log('Decode Upload:', res.error ? res.error.message : 'OK');
}
testLargeUpload();
