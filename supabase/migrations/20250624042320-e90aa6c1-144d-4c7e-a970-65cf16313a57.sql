
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active streams" ON public.streams;
DROP POLICY IF EXISTS "Users can create their own streams" ON public.streams;
DROP POLICY IF EXISTS "Users can update their own streams" ON public.streams;
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view tips they sent or received" ON public.tips;
DROP POLICY IF EXISTS "Authenticated users can send tips" ON public.tips;

-- Enable RLS on tables (won't error if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for streams table
CREATE POLICY "Anyone can view active streams" ON public.streams
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own streams" ON public.streams
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams" ON public.streams
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for chat messages
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send chat messages" ON public.chat_messages
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tips
CREATE POLICY "Users can view tips they sent or received" ON public.tips
FOR SELECT USING (auth.uid() = tipper_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send tips" ON public.tips
FOR INSERT WITH CHECK (auth.uid() = tipper_id);

-- Create or replace trigger function for tip totals
CREATE OR REPLACE FUNCTION update_tip_totals_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Update recipient's total tips received
  UPDATE public.profiles 
  SET total_tips_received = COALESCE(total_tips_received, 0) + NEW.amount
  WHERE id = NEW.recipient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_tip_inserted ON public.tips;
CREATE TRIGGER on_tip_inserted
  AFTER INSERT ON public.tips
  FOR EACH ROW
  EXECUTE FUNCTION update_tip_totals_trigger();

-- Enable realtime for key tables
ALTER TABLE public.streams REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.tips REPLICA IDENTITY FULL;
