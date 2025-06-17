
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('dj', 'fan', 'promoter', 'venue', 'sub_promoter');
CREATE TYPE stream_status AS ENUM ('offline', 'live', 'starting', 'ending');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'live', 'ended', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'declined');

-- Create profiles table (enhanced version)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'fan',
  website TEXT,
  instagram TEXT,
  spotify TEXT,
  soundcloud TEXT,
  location TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  follower_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streams table
CREATE TABLE public.streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stream_key TEXT UNIQUE NOT NULL,
  rtmp_url TEXT NOT NULL,
  hls_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status stream_status DEFAULT 'offline',
  viewer_count INTEGER DEFAULT 0,
  max_viewers INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  bitrate INTEGER DEFAULT 0,
  resolution TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue_name TEXT,
  venue_address TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  cover_image_url TEXT,
  ticket_price DECIMAL(10,2),
  ticket_capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  status event_status DEFAULT 'draft',
  stream_id UUID REFERENCES public.streams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create event lineup table
CREATE TABLE public.event_lineup (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  dj_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  set_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  is_headliner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Create song requests table
CREATE TABLE public.song_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  album_art_url TEXT,
  fan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  dj_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  message TEXT,
  tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create sub promoters table
CREATE TABLE public.sub_promoters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promoter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sub_promoter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  unique_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ticket sales table
CREATE TABLE public.ticket_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sub_promoter_id UUID REFERENCES public.profiles(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_lineup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for streams
CREATE POLICY "Live streams are viewable by everyone" ON public.streams
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own streams" ON public.streams
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Published events are viewable by everyone" ON public.events
  FOR SELECT USING (status != 'draft' OR auth.uid() = organizer_id);

CREATE POLICY "Users can manage their own events" ON public.events
  FOR ALL USING (auth.uid() = organizer_id);

-- Create RLS policies for event lineup
CREATE POLICY "Event lineups are viewable by everyone" ON public.event_lineup
  FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage lineup" ON public.event_lineup
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

-- Create RLS policies for follows
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.follows
  FOR ALL USING (auth.uid() = follower_id);

-- Create RLS policies for song requests
CREATE POLICY "Song requests are viewable by involved parties" ON public.song_requests
  FOR SELECT USING (auth.uid() = fan_id OR auth.uid() = dj_id);

CREATE POLICY "Fans can create song requests" ON public.song_requests
  FOR INSERT WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "DJs can update their song requests" ON public.song_requests
  FOR UPDATE USING (auth.uid() = dj_id);

-- Create RLS policies for sub promoters
CREATE POLICY "Sub promoters viewable by promoter and sub promoter" ON public.sub_promoters
  FOR SELECT USING (auth.uid() = promoter_id OR auth.uid() = sub_promoter_id);

CREATE POLICY "Promoters can manage their sub promoters" ON public.sub_promoters
  FOR ALL USING (auth.uid() = promoter_id);

-- Create RLS policies for ticket sales
CREATE POLICY "Ticket sales viewable by involved parties" ON public.ticket_sales
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = sub_promoter_id OR
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ticket purchases" ON public.ticket_sales
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'fan')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    UPDATE public.profiles 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    UPDATE public.profiles 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follower counts
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follower_counts();

-- Enable realtime for key tables
ALTER TABLE public.streams REPLICA IDENTITY FULL;
ALTER TABLE public.song_requests REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_streams_user_id ON public.streams(user_id);
CREATE INDEX idx_streams_status ON public.streams(status);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_song_requests_dj_id ON public.song_requests(dj_id);
CREATE INDEX idx_song_requests_fan_id ON public.song_requests(fan_id);
CREATE INDEX idx_song_requests_status ON public.song_requests(status);
