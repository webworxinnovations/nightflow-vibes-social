
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/cards/event-card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Event } from "@/lib/mock-data";

interface EventsTabsProps {
  events: Event[];
}

export const EventsTabs = ({ events }: EventsTabsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Events</h2>
        <Button onClick={() => navigate('/create-event')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live Now</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {events
              .filter(event => !event.isLive)
              .map(event => (
                <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="live" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {events
              .filter(event => event.isLive)
              .map(event => (
                <EventCard key={event.id} event={event} />
            ))}
            
            {events.filter(event => event.isLive).length === 0 && (
              <div className="col-span-2 py-12 text-center">
                <h3 className="text-lg font-semibold">No live events</h3>
                <p className="text-muted-foreground">
                  You don't have any events that are currently live
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {events.slice(0, 2).map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
