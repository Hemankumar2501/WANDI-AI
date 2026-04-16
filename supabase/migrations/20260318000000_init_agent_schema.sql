-- =========================================================================
-- WanderWiseAI — Agent System Database Schema (Supabase)
-- Creates tables for phase 3: Episodic Memory Layer
-- Enabled with strictest Row-Level Security (RLS) per user
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- 1) Trips
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trips (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- usually references auth.users(id), but kept generic for dev
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planning', 'booked', 'in_progress', 'completed', 'cancelled')),
    budget_usd NUMERIC(12,2) DEFAULT 0.0,
    travelers INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own trips" 
    ON public.trips FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips" 
    ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
    ON public.trips FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
    ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 2) Itinerary Days
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    day_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(trip_id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    theme TEXT,
    UNIQUE(trip_id, day_number)
);

ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view days for their trips" 
    ON public.itinerary_days FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = itinerary_days.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can insert days for their trips" 
    ON public.itinerary_days FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = itinerary_days.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can update days for their trips" 
    ON public.itinerary_days FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = itinerary_days.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can delete days for their trips" 
    ON public.itinerary_days FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = itinerary_days.trip_id AND trips.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- 3) Activities
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES public.itinerary_days(day_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('flight', 'hotel', 'experience', 'restaurant', 'transport', 'note')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    estimated_cost_usd NUMERIC(10,2) DEFAULT 0.0,
    "order" INTEGER DEFAULT 0
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for their trips" 
    ON public.activities FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.itinerary_days d
        JOIN public.trips t ON t.trip_id = d.trip_id
        WHERE d.day_id = activities.day_id AND t.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert activities to their trips" 
    ON public.activities FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.itinerary_days d
        JOIN public.trips t ON t.trip_id = d.trip_id
        WHERE d.day_id = activities.day_id AND t.user_id = auth.uid()
    ));

CREATE POLICY "Users can update activities on their trips" 
    ON public.activities FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM public.itinerary_days d
        JOIN public.trips t ON t.trip_id = d.trip_id
        WHERE d.day_id = activities.day_id AND t.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete activities from their trips" 
    ON public.activities FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM public.itinerary_days d
        JOIN public.trips t ON t.trip_id = d.trip_id
        WHERE d.day_id = activities.day_id AND t.user_id = auth.uid()
    ));

-- ─────────────────────────────────────────────────────────────────────────
-- 4) Bookings
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(trip_id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    reference TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'experience', 'car')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'pending_payment', 'cancelled')),
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" 
    ON public.bookings FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = bookings.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can format bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = bookings.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can update bookings" 
    ON public.bookings FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = bookings.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can delete bookings" 
    ON public.bookings FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = bookings.trip_id AND trips.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- 5) Expenses & Expense Splits
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
    expense_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(trip_id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Submitter
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    usd_equivalent NUMERIC(12,2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('accommodation', 'transport', 'food', 'activities', 'shopping', 'health', 'communication', 'other')),
    paid_by UUID NOT NULL,
    split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'custom', 'item')),
    settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expense_splits (
    split_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_id UUID NOT NULL REFERENCES public.expenses(expense_id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Person paying back
    amount NUMERIC(12,2) NOT NULL,
    settled BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can read expenses" 
    ON public.expenses FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can create expenses on their trip" 
    ON public.expenses FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can update expenses on their trip" 
    ON public.expenses FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can delete expenses on their trip" 
    ON public.expenses FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = expenses.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Trip members can read expense splits" 
    ON public.expense_splits FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.expenses e 
        JOIN public.trips t ON t.trip_id = e.trip_id 
        WHERE e.expense_id = expense_splits.expense_id AND t.user_id = auth.uid()
    ));

CREATE POLICY "Trip members can create expense splits" 
    ON public.expense_splits FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.expenses e 
        JOIN public.trips t ON t.trip_id = e.trip_id 
        WHERE e.expense_id = expense_splits.expense_id AND t.user_id = auth.uid()
    ));

CREATE POLICY "Trip members can update expense splits" 
    ON public.expense_splits FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM public.expenses e 
        JOIN public.trips t ON t.trip_id = e.trip_id 
        WHERE e.expense_id = expense_splits.expense_id AND t.user_id = auth.uid()
    ));

-- ─────────────────────────────────────────────────────────────────────────
-- 6) Journal Entries
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_entries (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    trip_id UUID REFERENCES public.trips(trip_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    location TEXT,
    mood TEXT,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'friends')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journal entries" 
    ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" 
    ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" 
    ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" 
    ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 7) Polls & Poll Votes
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.polls (
    poll_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(trip_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
    vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(poll_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    option_selected TEXT NOT NULL,
    UNIQUE(poll_id, user_id)
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view polls" 
    ON public.polls FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = polls.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Members can insert polls" 
    ON public.polls FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.trip_id = polls.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Members can update their polls" 
    ON public.polls FOR UPDATE 
    USING (auth.uid() = created_by);

CREATE POLICY "Members can view votes" 
    ON public.poll_votes FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.polls p 
        JOIN public.trips t ON t.trip_id = p.trip_id 
        WHERE p.poll_id = poll_votes.poll_id AND t.user_id = auth.uid()
    ));

CREATE POLICY "Users can cast votes" 
    ON public.poll_votes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes" 
    ON public.poll_votes FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create automatic `updated_at` trigger generator
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
CREATE TRIGGER set_timestamp_trips
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_journals
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
