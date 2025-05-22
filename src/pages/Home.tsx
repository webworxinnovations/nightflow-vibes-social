
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { PostCard } from "@/components/cards/post-card";
import { UserCard } from "@/components/cards/user-card";
import { EventCard } from "@/components/cards/event-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { users, posts, getLiveEvents, getLiveDjs } from "@/lib/mock-data";
import { Fire } from "lucide-react";

export default function Home() {
  const [liveDjs, setLiveDjs] = useState(getLiveDjs());
  const [liveEvents, setLiveEvents] = useState(getLiveEvents());
  
  return (
    <div className="flex flex-col gap-6">
      <h1 className="gradient-text text-3xl font-bold">NightFlow</h1>
      
      {/* Live Now Section */}
      {(liveDjs.length > 0 || liveEvents.length > 0) && (
        <section>
          <div className="mb-4 flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
            <h2 className="text-xl font-semibold">Live Now</h2>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {liveEvents.map((event) => (
                <div key={event.id} className="w-80 flex-none">
                  <GlassmorphicCard className="relative h-40 overflow-hidden" glowEffect>
                    <img
                      src={event.image}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      <p className="text-sm text-white/80">{event.venue}</p>
                      
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Fire
                            key={i}
                            className={`h-5 w-5 ${i < event.vibe! ? "text-orange-500" : "text-gray-400"}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-white/80">
                          {event.ticketsSold}/{event.maxCapacity} attendees
                        </span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/events/${event.id}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100"
                    >
                      <Button>View Event</Button>
                    </Link>
                  </GlassmorphicCard>
                </div>
              ))}
              
              {liveDjs.map((dj) => (
                <div key={dj.id} className="w-60 flex-none">
                  <GlassmorphicCard className="h-40 p-0 overflow-hidden" glowEffect>
                    <div className="relative h-full">
                      <img
                        src={dj.coverImage}
                        alt={dj.name}
                        className="h-full w-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-center w-full">
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="absolute inset-0 animate-pulse rounded-full border-2 border-red-500"></div>
                            <div className="relative z-10">
                              <img
                                src={dj.avatar}
                                alt={dj.name}
                                className="h-16 w-16 rounded-full border-2 border-white object-cover"
                              />
                            </div>
                          </div>
                          <h3 className="mt-1 text-lg font-bold text-white">{dj.name}</h3>
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                            LIVE
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/profile/${dj.id}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100"
                      >
                        <Button>View Profile</Button>
                      </Link>
                    </div>
                  </GlassmorphicCard>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <h2 className="mb-4 text-xl font-semibold">Popular DJs</h2>
          <div className="space-y-4">
            {users
              .filter((user) => user.role === 'dj')
              .slice(0, 3)
              .map((dj) => (
                <UserCard key={dj.id} user={dj} />
              ))}
          </div>
          
          <Separator className="my-6 bg-white/10" />
          
          <h2 className="mb-4 text-xl font-semibold">Trending Genres</h2>
          <div className="space-y-2">
            {['House', 'Techno', 'Hip-Hop', 'Drum & Bass', 'Trance'].map((genre) => (
              <Button 
                key={genre} 
                variant="outline" 
                className="w-full justify-start border-white/10 text-left hover:bg-white/5"
              >
                #{genre}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Feed */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Your Feed</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block">
          <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
          <div className="space-y-4">
            {liveEvents.concat(liveEvents).slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
            
            <Button className="w-full" variant="outline">
              View All Events
            </Button>
          </div>
          
          <Separator className="my-6 bg-white/10" />
          
          <GlassmorphicCard>
            <h3 className="mb-2 text-lg font-semibold gradient-text">TipDrop</h3>
            <p className="text-sm text-muted-foreground">
              Request songs from your favorite DJs and support them with tips.
            </p>
            <Button className="mt-4 w-full">Learn More</Button>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
