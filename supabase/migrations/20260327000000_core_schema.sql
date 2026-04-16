-- ══════════════════════════════════════════════════════════════════════════
-- WanderWise AI — Core Schema Migration
-- Sets up the database foundation for Users, Profiles, Trips, and AI Memory
-- ══════════════════════════════════════════════════════════════════════════

-- Enable necessary Postgres extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Essential for Pinecone fallback or local AI embeddings

-- ── 1. PROFILES TABLE ───────────────────────────────────────────────────
-- Extends the built-in Supabase auth.users table with application data

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    travel_style TEXT, -- e.g., 'Luxury', 'Budget', 'Adventure'
    preferences JSONB DEFAULT '{}'::JSONB, -- AI learned preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read and update their own profiles
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Traveller'),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── 2. TRIPS TABLE ──────────────────────────────────────────────────────
-- Stores active and past trips created by the AI or the user

CREATE TYPE trip_status AS ENUM ('planning', 'upcoming', 'active', 'completed', 'cancelled');

CREATE TABLE public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status trip_status DEFAULT 'planning' NOT NULL,
    image_url TEXT,
    notes TEXT,
    itinerary_data JSONB DEFAULT '{}'::JSONB, -- The structured JSON from the AI planner
    estimated_cost NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own trips" 
    ON public.trips FOR ALL USING (auth.uid() = user_id);


-- ── 3. CHAT SESSIONS ────────────────────────────────────────────────────
-- Stores continuous conversations with the AI orchestrator

CREATE TABLE public.chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL, -- Optional link to a specific trip
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own chats" 
    ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);


-- ── 4. CHAT MESSAGES ────────────────────────────────────────────────────
-- Stores the actual message history for AI context window loading

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own messages" 
    ON public.chat_messages FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.chat_sessions cs
            WHERE cs.id = chat_messages.session_id AND cs.user_id = auth.uid()
        )
    );


-- ── 5. UTILITY: UPDATE TIMESTAMP TRIGGERS ───────────────────────────────
-- Automatically bumps 'updated_at' when a row is modified

CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime 
    BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_trips_modtime 
    BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_chat_sessions_modtime 
    BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
