
import { useState } from "react";
import { UserCard } from "@/components/cards/user-card";
import { EventCard } from "@/components/cards/event-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users, events } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("djs");
  
  const djs = users.filter((user) => user.role === 'dj');
  const filteredDjs = djs.filter((dj) => 
    dj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dj.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dj.genres?.some((genre) => 
      genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.lineup.some((dj) => 
      dj.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Discover</h1>
      
      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search DJs, events, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>
      
      <Tabs defaultValue="djs" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="djs">DJs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="djs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredDjs.map((dj) => (
              <UserCard key={dj.id} user={dj} />
            ))}
            
            {filteredDjs.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-semibold">No DJs found</h3>
                <p className="text-muted-foreground">
                  Try a different search term or browse through genres
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
                  Try a different search term or check back later
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {activeTab === "djs" && filteredDjs.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {['House', 'Techno', 'Hip-Hop', 'R&B', 'Trance', 'Drum & Bass', 'Dubstep', 'Trap'].map((genre) => (
              <Button 
                key={genre} 
                variant="outline" 
                className="border-white/10 hover:bg-primary/20"
                onClick={() => setSearchQuery(genre)}
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
