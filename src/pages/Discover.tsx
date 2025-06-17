import { useState } from "react";
import { UserCard } from "@/components/cards/user-card";
import { EventCard } from "@/components/cards/event-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users, events } from "@/lib/mock-data";
import { Search, Filter, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Event } from "@/hooks/useEvents";

// Define filter types
type UserRole = 'all' | 'dj' | 'promoter' | 'venue';
type EventFilter = 'all' | 'upcoming' | 'live';
type GenreFilter = 'all' | string;

// Transform mock events to match the Event interface
const transformMockEventToEvent = (mockEvent: any): Event => ({
  id: mockEvent.id,
  title: mockEvent.title,
  description: mockEvent.description || '',
  venue_name: mockEvent.venue,
  venue_address: mockEvent.address,
  start_time: new Date(`${mockEvent.date}T${mockEvent.time || '20:00'}`).toISOString(),
  end_time: new Date(`${mockEvent.date}T23:59`).toISOString(),
  cover_image_url: mockEvent.image,
  ticket_price: mockEvent.price,
  ticket_capacity: mockEvent.maxCapacity,
  tickets_sold: mockEvent.ticketsSold || 0,
  status: mockEvent.isLive ? 'live' : 'published',
  organizer_id: 'mock-organizer',
  stream_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // Compatibility properties
  date: mockEvent.date,
  time: mockEvent.time,
  venue: mockEvent.venue,
  address: mockEvent.address,
  price: mockEvent.price,
  capacity: mockEvent.maxCapacity,
  attendees: mockEvent.ticketsSold,
  image: mockEvent.image,
  lineup: mockEvent.lineup || [],
  ticketsSold: mockEvent.ticketsSold,
  maxCapacity: mockEvent.maxCapacity,
  promoter: mockEvent.promoter?.name,
  isLive: mockEvent.isLive
});

export default function Discover() {
  const { profile } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("djs");
  const [roleFilter, setRoleFilter] = useState<UserRole>('all');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  
  // Check if user has creator role (dj, promoter, venue)
  const isCreatorRole = () => {
    if (!profile) return false;
    return ["dj", "promoter", "venue"].includes(profile.role);
  };
  
  // Transform mock events to Event type
  const transformedEvents: Event[] = events.map(transformMockEventToEvent);
  
  // Extract all unique genres from users
  const allGenres = Array.from(
    new Set(
      users
        .filter(user => user.genres)
        .flatMap(user => user.genres || [])
    )
  ).sort();
  
  // Filter users based on search, role, and genre
  const filteredUsers = users.filter((user) => {
    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Genre filter
    if (genreFilter !== 'all' && 
        (!user.genres || !user.genres.some(genre => 
          genre.toLowerCase() === genreFilter.toLowerCase()
        ))
    ) {
      return false;
    }
    
    // Search query filter
    if (searchQuery) {
      return (
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.genres && user.genres.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return true;
  });
  
  // Filter events based on search, filter type, and associated DJs/venues/promoters
  const filteredEvents = transformedEvents.filter((event) => {
    // Event type filter
    if (eventFilter === 'upcoming' && event.isLive) {
      return false;
    }
    if (eventFilter === 'live' && !event.isLive) {
      return false;
    }
    
    // Genre filter (check if any DJ in the lineup matches the genre)
    if (genreFilter !== 'all') {
      const hasMatchingDj = event.lineup && event.lineup.some(dj => 
        dj.genres && dj.genres.includes(genreFilter)
      );
      if (!hasMatchingDj) {
        return false;
      }
    }
    
    // Search query filter
    if (searchQuery) {
      return (
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.lineup && event.lineup.some(dj => 
          dj.name.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        (event.address && event.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.promoter && event.promoter.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return true;
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Discover</h1>
        
        {/* Show Add Event button only for creator roles */}
        {isCreatorRole() && (
          <Link to="/create-event">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </Link>
        )}
      </div>
      
      <div className="mb-6 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search DJs, events, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Filters section */}
        <div className="flex space-x-2">
          {activeTab === "djs" ? (
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole)}>
              <SelectTrigger className="w-[120px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="dj">DJs</SelectItem>
                <SelectItem value="promoter">Promoters</SelectItem>
                <SelectItem value="venue">Venues</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select value={eventFilter} onValueChange={(value) => setEventFilter(value as EventFilter)}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live Now</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Select value={genreFilter} onValueChange={(value) => setGenreFilter(value as GenreFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {allGenres.map(genre => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="djs" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="djs">DJs & Venues</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="djs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-semibold">No matches found</h3>
                <p className="text-muted-foreground">
                  Try different filters or search terms
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-semibold">No events found</h3>
                <p className="text-muted-foreground">
                  Try different filters or check back later
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {activeTab === "djs" && filteredUsers.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {allGenres.slice(0, 8).map((genre) => (
              <Button 
                key={genre} 
                variant="outline" 
                className={`border-white/10 hover:bg-primary/20 ${genreFilter === genre ? 'bg-primary/20 border-primary' : ''}`}
                onClick={() => setGenreFilter(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
