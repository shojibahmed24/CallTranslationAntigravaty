import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLargeBlobUpload() {
  const randomBytes = crypto.randomBytes(1819710); // 1.8MB
  const base64Data = randomBytes.toString('base64');
  
  const cleanBuffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([cleanBuffer], { type: 'image/jpeg' });
  
  let res = await supabase.storage.from('avatars').upload('test/large_blob.jpg', blob, { contentType: 'image/jpeg', upsert: true });
  console.log('Blob Upload:', res.error ? res.error.message : 'OK');
}
testLargeBlobUpload();
