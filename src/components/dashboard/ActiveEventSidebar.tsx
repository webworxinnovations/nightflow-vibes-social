
import React from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Event } from "@/lib/mock-data";

interface ActiveEventSidebarProps {
  activeEvent: Event | undefined;
}

export const ActiveEventSidebar = ({ activeEvent }: ActiveEventSidebarProps) => {
  return (
    <GlassmorphicCard>
      <h2 className="text-xl font-semibold">Active Event</h2>
      
      {activeEvent?.isLive ? (
        <div className="mt-4">
          <div className="relative mb-3 overflow-hidden rounded-md">
            <img
              src={activeEvent.image}
              alt={activeEvent.title}
              className="w-full"
            />
            <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              LIVE NOW
            </div>
          </div>
          
          <h3 className="font-semibold">{activeEvent.title}</h3>
          <p className="text-sm text-muted-foreground">{activeEvent.venue}</p>
          
          <div className="mt-3 flex justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Attendees</p>
              <p className="font-medium">
                {activeEvent.ticketsSold}/{activeEvent.maxCapacity}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="font-medium">
                ${activeEvent.ticketsSold * activeEvent.price}
              </p>
            </div>
          </div>
          
          <Button className="mt-4 w-full">View Event Dashboard</Button>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 font-medium">No Live Events</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any events live right now
          </p>
          <Button className="mt-4 w-full" variant="outline">
            Start an Event
          </Button>
        </div>
      )}
    </GlassmorphicCard>
  );
};
