
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { PostCard } from "@/components/cards/post-card";
import { EventCard } from "@/components/cards/event-card";
import { users, events, getDjById, getPostsByUser } from "@/lib/mock-data";
import {
  Heart,
  Calendar,
  User,
  Share,
  Music,
  MapPin,
  ArrowLeft
} from "lucide-react";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState(getDjById(id || "1"));
  const [posts, setPosts] = useState(getPostsByUser(id || "1"));
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(user?.followers || 0);
  
  useEffect(() => {
    if (id) {
      const userData = getDjById(id);
      const userPosts = getPostsByUser(id);
      setUser(userData);
      setPosts(userPosts);
      setIsFollowing(userData?.isFollowing || false);
      setFollowerCount(userData?.followers || 0);
    }
  }, [id]);
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
  };
  
  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="mt-2 text-muted-foreground">
            The DJ profile you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/discover">Discover DJs</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Filter upcoming events for this DJ
  const djEvents = events.filter((event) => 
    event.lineup.some((dj) => dj.id === user.id)
  );
  
  return (
    <div>
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/discover">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
        </Link>
      </Button>
      
      {/* Cover Image and Profile */}
      <div className="relative mb-20 h-64 overflow-hidden rounded-lg sm:h-80">
        <img
          src={user.coverImage}
          alt={`${user.name} cover`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {user.isLive && (
          <div className="absolute top-4 right-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white animate-pulse">
            LIVE NOW
          </div>
        )}
        
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 transform text-center sm:left-8 sm:translate-x-0 sm:text-left">
          <div className="relative inline-block">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.isLive && (
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-background bg-red-500"></div>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button size="sm" variant="outline" className="bg-background/20 backdrop-blur-sm">
            <Share className="mr-1 h-4 w-4" />
            Share
          </Button>
          <Button 
            size="sm" 
            variant={isFollowing ? "outline" : "default"}
            className={isFollowing ? "bg-background/20 backdrop-blur-sm" : ""}
            onClick={handleFollow}
          >
            <Heart className={`mr-1 h-4 w-4 ${isFollowing ? "fill-primary" : ""}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="ml-0 mt-16 sm:ml-40 sm:mt-0">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {user.genres?.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs text-primary"
                >
                  <Music className="mr-1 h-3 w-3" />
                  {genre}
                </span>
              ))}
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold">{followerCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{user.following?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{djEvents.length}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="posts" className="mt-8">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {posts.length === 0 && (
                  <div className="py-12 text-center">
                    <h3 className="text-lg font-semibold">No posts yet</h3>
                    <p className="text-muted-foreground">
                      {user.name} hasn't posted anything yet
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {djEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                
                {djEvents.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <h3 className="text-lg font-semibold">No upcoming events</h3>
                    <p className="text-muted-foreground">
                      {user.name} doesn't have any upcoming events
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="mt-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {posts
                  .filter((post) => post.image)
                  .map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square overflow-hidden rounded-md"
                    >
                      <img
                        src={post.image}
                        alt="Media"
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                  ))}
                
                {posts.filter((post) => post.image).length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <h3 className="text-lg font-semibold">No media yet</h3>
                    <p className="text-muted-foreground">
                      {user.name} hasn't posted any photos or videos
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <GlassmorphicCard>
            <h2 className="text-xl font-semibold">About</h2>
            <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
            
            <Separator className="my-4 bg-white/10" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined March 2023</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.genres?.join(', ')}</span>
              </div>
            </div>
          </GlassmorphicCard>
          
          {user.isLive && (
            <GlassmorphicCard className="mt-6" glowEffect>
              <h2 className="text-xl font-semibold text-red-500">Live Now</h2>
              <p className="mt-2 text-sm">
                {user.name} is currently playing at:
              </p>
              
              <div className="mt-4">
                {events
                  .filter((event) => event.isLive && event.lineup.some((dj) => dj.id === user.id))
                  .map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block rounded-md bg-primary/10 p-3 hover:bg-primary/20"
                    >
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    </Link>
                  ))}
              </div>
              
              <Button className="mt-4 w-full">
                <Music className="mr-2 h-4 w-4" />
                Request a Song
              </Button>
            </GlassmorphicCard>
          )}
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Similar DJs</h2>
            <div className="mt-4 space-y-3">
              {users
                .filter((u) => u.id !== user.id && u.role === 'dj')
                .slice(0, 3)
                .map((dj) => (
                  <Link
                    key={dj.id}
                    to={`/profile/${dj.id}`}
                    className="flex items-center gap-3 hover:text-primary"
                  >
                    <Avatar>
                      <AvatarImage src={dj.avatar} alt={dj.name} />
                      <AvatarFallback>{dj.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{dj.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dj.genres?.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
