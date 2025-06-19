
-- First, let's ensure we have all the necessary enums
DO $$ BEGIN
    CREATE TYPE stream_status AS ENUM ('offline', 'live', 'starting', 'ending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to include streaming-related fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streaming_title TEXT,
ADD COLUMN IF NOT EXISTS streaming_description TEXT,
ADD COLUMN IF NOT EXISTS total_tips_received DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_streams INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streamed_at TIMESTAMP WITH TIME ZONE;

-- Create tips table for the tipping system
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  message TEXT,
  song_request TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create stream_viewers table for tracking who's watching
CREATE TABLE IF NOT EXISTS public.stream_viewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  left_at TIMESTAMP WITH TIME ZONE,
  anonymous_id TEXT, -- For non-logged in viewers
  UNIQUE(stream_id, viewer_id),
  UNIQUE(stream_id, anonymous_id)
);

-- Create chat_messages table for live chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  is_tip BOOLEAN DEFAULT false,
  tip_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tips
CREATE POLICY "Users can view tips they sent or received" ON public.tips
  FOR SELECT USING (auth.uid() = tipper_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send tips" ON public.tips
  FOR INSERT WITH CHECK (auth.uid() = tipper_id);

-- RLS Policies for stream_viewers
CREATE POLICY "Anyone can view stream viewers" ON public.stream_viewers
  FOR SELECT USING (true);

CREATE POLICY "Users can join streams" ON public.stream_viewers
  FOR INSERT WITH CHECK (auth.uid() = viewer_id OR viewer_id IS NULL);

CREATE POLICY "Users can update their own viewer record" ON public.stream_viewers
  FOR UPDATE USING (auth.uid() = viewer_id);

-- RLS Policies for chat_messages
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tips_recipient_id ON public.tips(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tips_stream_id ON public.tips(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream_id ON public.stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_stream_id ON public.chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable realtime for new tables only (streams is already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_viewers;

-- Set replica identity for realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.stream_viewers REPLICA IDENTITY FULL;

-- Function to update total tips received
CREATE OR REPLACE FUNCTION public.update_tip_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET total_tips_received = total_tips_received + NEW.amount
  WHERE id = NEW.recipient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tip totals
DROP TRIGGER IF EXISTS update_tip_totals_trigger ON public.tips;
CREATE TRIGGER update_tip_totals_trigger
  AFTER INSERT ON public.tips
  FOR EACH ROW EXECUTE FUNCTION public.update_tip_totals();
