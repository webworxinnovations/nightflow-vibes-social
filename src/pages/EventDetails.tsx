
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { UserCard } from "@/components/cards/user-card";
import { events, getEventById, formatDate } from "@/lib/mock-data";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share,
  QrCode,
  Ticket,
  Fire,
  ArrowLeft
} from "lucide-react";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState(getEventById(id || "1"));
  const [vibe, setVibe] = useState(event?.vibe || 0);
  
  if (!event) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Event not found</h2>
          <p className="mt-2 text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Link>
      </Button>
      
      <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 md:h-96">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {event.isLive && (
          <div className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
            LIVE NOW
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{event.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-white">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {event.venue}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              {event.ticketsSold}/{event.maxCapacity}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="info">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="lineup">Lineup</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-6">
              <GlassmorphicCard>
                <h2 className="text-xl font-semibold">About the Event</h2>
                <p className="mt-4 text-muted-foreground">{event.description}</p>
                
                <Separator className="my-6 bg-white/10" />
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium">Promoter</h3>
                    <div className="mt-2 flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={event.promoter.avatar} alt={event.promoter.name} />
                        <AvatarFallback>{event.promoter.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Link 
                        to={`/profile/${event.promoter.id}`}
                        className="ml-2 text-sm hover:text-primary"
                      >
                        {event.promoter.name}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <QrCode className="mr-2 h-4 w-4" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </GlassmorphicCard>
              
              {event.isLive && (
                <GlassmorphicCard className="mt-6">
                  <h2 className="text-xl font-semibold">Live Event Vibes</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    How's the crowd energy? Rate the vibes!
                  </p>
                  
                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        className="transition-transform hover:scale-125"
                        onClick={() => setVibe(i + 1)}
                      >
                        <Fire
                          className={`h-8 w-8 ${
                            i < vibe ? "text-orange-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${(event.vibe! / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Chill</span>
                    <span>Fire</span>
                  </div>
                </GlassmorphicCard>
              )}
            </TabsContent>
            
            <TabsContent value="lineup" className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Event Lineup</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {event.lineup.map((dj) => (
                  <UserCard key={dj.id} user={dj} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-6">
              <GlassmorphicCard>
                <h2 className="text-xl font-semibold">Venue Information</h2>
                <div className="mt-4">
                  <h3 className="font-medium">{event.venue}</h3>
                  <p className="text-muted-foreground">{event.address}</p>
                </div>
                
                <div className="mt-4 h-64 w-full overflow-hidden rounded-md bg-muted">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Map would be displayed here
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button className="w-full sm:w-auto">Get Directions</Button>
                </div>
              </GlassmorphicCard>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <GlassmorphicCard>
            <h2 className="text-xl font-semibold">Tickets</h2>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span>General Admission</span>
                <span className="font-medium">${event.price}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.ticketsSold}/{event.maxCapacity} sold
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(event.ticketsSold / event.maxCapacity) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <Button className="mt-6 w-full">
              <Ticket className="mr-2 h-5 w-5" />
              Buy Tickets
            </Button>
            
            <Separator className="my-6 bg-white/10" />
            
            <h3 className="font-medium">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Add to Calendar
              </Button>
              <Button variant="outline" size="sm">
                Invite Friends
              </Button>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Similar Events</h2>
            <div className="mt-4 space-y-4">
              {events
                .filter((e) => e.id !== event.id)
                .slice(0, 2)
                .map((similarEvent) => (
                  <Link
                    key={similarEvent.id}
                    to={`/events/${similarEvent.id}`}
                    className="flex gap-3 hover:opacity-80"
                  >
                    <img
                      src={similarEvent.image}
                      alt={similarEvent.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{similarEvent.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(similarEvent.date)}
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
