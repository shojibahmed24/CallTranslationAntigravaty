-- Drop type check constraint
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_type_check;

-- Add new columns for React Native App
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS emoji BOOLEAN DEFAULT FALSE;

-- Ensure chat-media bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure public access to chat-media
DROP POLICY IF EXISTS "Allow public access to chat-media" ON storage.objects;
CREATE POLICY "Allow public access to chat-media" ON storage.objects FOR ALL USING (bucket_id = 'chat-media');

