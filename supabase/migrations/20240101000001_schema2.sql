-- UNICOM Phase 1 (Part 2) SQL Schema Migration
-- Please copy and paste this entire file into the Supabase SQL Editor and click "Run".

-- 1. Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS translated_minutes_used_today NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS translated_minutes_used_month NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT '{"lastSeen": "everyone", "profilePhoto": "everyone", "readReceipts": true, "allowUnknownCalls": true}'::jsonb,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS online_status TEXT DEFAULT 'offline';

-- 2. Calls Table
CREATE TABLE IF NOT EXISTS public.calls (
    id TEXT PRIMARY KEY,
    caller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    caller_lang TEXT NOT NULL,
    receiver_lang TEXT NOT NULL,
    is_translated BOOLEAN DEFAULT false,
    duration_seconds INTEGER DEFAULT 0,
    translation_minutes_charged INTEGER DEFAULT 0,
    status TEXT DEFAULT 'initiating',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_phone TEXT,
    plan_id TEXT,
    plan_name TEXT,
    amount_usd NUMERIC,
    amount_usdt NUMERIC,
    network TEXT,
    wallet_address TEXT,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    rejection_reason TEXT
);

-- 4. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_phone TEXT,
    category TEXT,
    subject TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'high',
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    admin_email TEXT,
    action TEXT,
    details TEXT,
    ip TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Telemetry Table
CREATE TABLE IF NOT EXISTS public.telemetry (
    id TEXT PRIMARY KEY,
    call_id TEXT,
    pair TEXT,
    duration_seconds INTEGER,
    avg_latency_ms INTEGER,
    packet_loss_percent NUMERIC,
    barge_in_events INTEGER,
    success BOOLEAN,
    failure_reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON public.calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver_id ON public.calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
