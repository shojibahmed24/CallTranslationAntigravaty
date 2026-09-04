-- UNICOM Supabase Schema Migration
-- Please copy and paste this entire file into the Supabase SQL Editor and click "Run".

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_picture TEXT,
    status TEXT DEFAULT 'Hey there! I am using UNICOM.',
    active_device_id TEXT,
    role TEXT DEFAULT 'user',
    wallet_balance NUMERIC DEFAULT 0.0,
    is_approved BOOLEAN DEFAULT false,
    has_requested_approval BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chat Participants Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.chat_participants (
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chat_id, user_id)
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    text TEXT,
    type TEXT CHECK (type IN ('text', 'audio', 'image', 'file')) DEFAULT 'text',
    file_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Settings Table (for admin configs)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Settings
INSERT INTO public.settings (key, value) VALUES 
('minWithdrawal', '10'::jsonb),
('translationDelay', '2000'::jsonb),
('translationEnabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Security / Row Level Security (RLS)
-- We'll rely on our backend Node.js server (using the Service Role Key) to bypass RLS.
-- However, we can enable RLS to block direct client access from the web/mobile app just in case.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
