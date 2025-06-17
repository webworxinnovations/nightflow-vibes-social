
-- Enable Row Level Security
alter database postgres set "app.jwt_secret" to 'your-jwt-secret';

-- Create custom types
create type user_role as enum ('dj', 'fan', 'promoter', 'venue', 'sub_promoter');
create type stream_status as enum ('offline', 'live', 'starting', 'ending');
create type event_status as enum ('draft', 'published', 'live', 'ended', 'cancelled');

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  role user_role default 'fan',
  website text,
  instagram text,
  spotify text,
  soundcloud text,
  location text,
  verified boolean default false,
  follower_count integer default 0,
  following_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Streams table
create table public.streams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stream_key text unique not null,
  rtmp_url text not null,
  hls_url text not null,
  title text,
  description text,
  status stream_status default 'offline',
  viewer_count integer default 0,
  max_viewers integer default 0,
  duration integer default 0,
  bitrate integer default 0,
  resolution text default '',
  is_active boolean default true,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  venue_name text,
  venue_address text,
  venue_coordinates point,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  cover_image_url text,
  ticket_price decimal(10,2),
  ticket_capacity integer,
  tickets_sold integer default 0,
  status event_status default 'draft',
  stream_id uuid references public.streams(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Event lineup (DJs performing at events)
create table public.event_lineup (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  dj_id uuid references public.profiles(id) on delete cascade not null,
  set_time timestamp with time zone,
  duration_minutes integer default 60,
  is_headliner boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Follows table
create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Posts table (social media posts)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image_url text,
  video_url text,
  event_id uuid references public.events(id),
  stream_id uuid references public.streams(id),
  like_count integer default 0,
  comment_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sub-promoters table
create table public.sub_promoters (
  id uuid default gen_random_uuid() primary key,
  promoter_id uuid references public.profiles(id) on delete cascade not null,
  sub_promoter_id uuid references public.profiles(id) on delete cascade not null,
  commission_rate decimal(5,2) default 20.00,
  total_sales decimal(10,2) default 0,
  total_commission decimal(10,2) default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ticket sales table
create table public.ticket_sales (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  sub_promoter_id uuid references public.profiles(id),
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_amount decimal(10,2) not null,
  commission_amount decimal(10,2) default 0,
  payment_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.streams enable row level security;
alter table public.events enable row level security;
alter table public.event_lineup enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.sub_promoters enable row level security;
alter table public.ticket_sales enable row level security;

-- RLS Policies

-- Profiles: Users can view all profiles, but only edit their own
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Streams: Users can view live streams, but only manage their own
create policy "Live streams are viewable by everyone" on public.streams
  for select using (true);

create policy "Users can insert their own streams" on public.streams
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own streams" on public.streams
  for update using (auth.uid() = user_id);

create policy "Users can delete their own streams" on public.streams
  for delete using (auth.uid() = user_id);

-- Events: Public events viewable by all, only organizers can manage
create policy "Published events are viewable by everyone" on public.events
  for select using (status != 'draft' or auth.uid() = organizer_id);

create policy "Users can insert their own events" on public.events
  for insert with check (auth.uid() = organizer_id);

create policy "Users can update their own events" on public.events
  for update using (auth.uid() = organizer_id);

create policy "Users can delete their own events" on public.events
  for delete using (auth.uid() = organizer_id);

-- Follows: Users can view all follows, manage their own
create policy "Follows are viewable by everyone" on public.follows
  for select using (true);

create policy "Users can follow others" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow others" on public.follows
  for delete using (auth.uid() = follower_id);

-- Posts: Public posts viewable by all, users manage their own
create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

create policy "Users can insert their own posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- Likes: Users can view all likes, manage their own
create policy "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy "Users can like posts" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts" on public.likes
  for delete using (auth.uid() = user_id);

-- Comments: Users can view all comments, manage their own
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Users can insert their own comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments" on public.comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Functions to update follower counts
create or replace function public.update_follower_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    -- Increase following count for follower
    update public.profiles 
    set following_count = following_count + 1 
    where id = NEW.follower_id;
    
    -- Increase follower count for followed user
    update public.profiles 
    set follower_count = follower_count + 1 
    where id = NEW.following_id;
    
    return NEW;
  elsif TG_OP = 'DELETE' then
    -- Decrease following count for follower
    update public.profiles 
    set following_count = following_count - 1 
    where id = OLD.follower_id;
    
    -- Decrease follower count for followed user
    update public.profiles 
    set follower_count = follower_count - 1 
    where id = OLD.following_id;
    
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for follower counts
create trigger update_follower_counts_trigger
  after insert or delete on public.follows
  for each row execute function public.update_follower_counts();

-- Function to update like counts
create or replace function public.update_like_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts 
    set like_count = like_count + 1 
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts 
    set like_count = like_count - 1 
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for like counts
create trigger update_like_counts_trigger
  after insert or delete on public.likes
  for each row execute function public.update_like_counts();

-- Function to update comment counts
create or replace function public.update_comment_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts 
    set comment_count = comment_count + 1 
    where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts 
    set comment_count = comment_count - 1 
    where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for comment counts
create trigger update_comment_counts_trigger
  after insert or delete on public.comments
  for each row execute function public.update_comment_counts();

-- Create indexes for better performance
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_role on public.profiles(role);
create index idx_streams_user_id on public.streams(user_id);
create index idx_streams_status on public.streams(status);
create index idx_events_organizer_id on public.events(organizer_id);
create index idx_events_start_time on public.events(start_time);
create index idx_events_status on public.events(status);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_likes_post_id on public.likes(post_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_comments_post_id on public.comments(post_id);

