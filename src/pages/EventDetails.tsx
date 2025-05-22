
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { events, getEventById } from "@/lib/mock-data";
import { EventHeader } from "@/components/events/EventHeader";
import { EventInfo } from "@/components/events/EventInfo";
import { EventLineup } from "@/components/events/EventLineup";
import { EventLocation } from "@/components/events/EventLocation";
import { EventSidebar } from "@/components/events/EventSidebar";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState(getEventById(id || "1"));
  const [vibe, setVibe] = useState(event?.vibe || 0);
  
  const handleVibeChange = (newVibe: number) => {
    setVibe(newVibe);
    // In a real app, this would send the vibe rating to the backend
  };
  
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
  
  const similarEvents = events
    .filter((e) => e.id !== event.id)
    .slice(0, 2);
  
  return (
    <div>
      <EventHeader 
        image={event.image}
        title={event.title}
        date={event.date}
        time={event.time}
        venue={event.venue}
        ticketsSold={event.ticketsSold}
        maxCapacity={event.maxCapacity}
        isLive={event.isLive || false}
      />
      
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="info">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="lineup">Lineup</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-6">
              <EventInfo 
                description={event.description}
                promoter={event.promoter}
                isLive={event.isLive || false}
                vibe={vibe}
                onVibeChange={handleVibeChange}
              />
            </TabsContent>
            
            <TabsContent value="lineup" className="mt-6">
              <EventLineup lineup={event.lineup} />
            </TabsContent>
            
            <TabsContent value="location" className="mt-6">
              <EventLocation 
                venue={event.venue} 
                address={event.address} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <EventSidebar 
            event={event}
            similarEvents={similarEvents}
          />
        </div>
      </div>
    </div>
  );
}
