-- UNICOM Settings & Personalization Update
-- Copy and run this in your Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS chat_wallpaper TEXT DEFAULT 'default';
