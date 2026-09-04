import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kxkabnahclcsitfkllvg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
  console.log('Attempting to create buckets...');
  
  // 1. Create payment_proofs bucket
  const { data: b1, error: e1 } = await supabase.storage.createBucket('payment_proofs', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  });
  
  if (e1 && e1.message !== 'The resource already exists') {
    console.error('Error creating payment_proofs:', e1.message);
  } else {
    console.log('payment_proofs bucket ready.');
  }

  // 2. Create chat_media bucket
  const { data: b2, error: e2 } = await supabase.storage.createBucket('chat_media', {
    public: true,
    fileSizeLimit: 26214400 // 25MB
  });
  
  if (e2 && e2.message !== 'The resource already exists') {
    console.error('Error creating chat_media:', e2.message);
  } else {
    console.log('chat_media bucket ready.');
  }
}

createBuckets();
