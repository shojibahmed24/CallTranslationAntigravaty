import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:/Users/rajsh/.gemini/antigravity/scratch/unicom-app/server/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function test() {
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(base64Data, 'base64');
  
  // 1. Buffer
  let res = await supabase.storage.from('avatars').upload('test/buffer.png', buffer, { contentType: 'image/png', upsert: true });
  console.log('Buffer:', res.error ? res.error.message : 'OK');
  
  // 2. ArrayBuffer
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  res = await supabase.storage.from('avatars').upload('test/ab.png', arrayBuffer, { contentType: 'image/png', upsert: true });
  console.log('ArrayBuffer:', res.error ? res.error.message : 'OK');
  
  // 3. Blob (using fetch Blob polyfill)
  const blob = new Blob([arrayBuffer], { type: 'image/png' });
  res = await supabase.storage.from('avatars').upload('test/blob.png', blob, { contentType: 'image/png', upsert: true });
  console.log('Blob:', res.error ? res.error.message : 'OK');
}
test();
