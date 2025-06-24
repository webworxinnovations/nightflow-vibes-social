
import { EventCard } from "@/components/cards/event-card";
import { Button } from "@/components/ui/button";
import { Event } from "@/hooks/useEvents";

interface UpcomingEventsSidebarProps {
  transformedLiveEvents: Event[];
}

export const UpcomingEventsSidebar = ({ transformedLiveEvents }: UpcomingEventsSidebarProps) => {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]">Upcoming Events</h2>
      <div className="space-y-4">
        {transformedLiveEvents.concat(transformedLiveEvents).slice(0, 2).map((event) => (
          <EventCard key={event.id} event={event} compact />
        ))}
        
        <Button className="w-full bg-teal-500/80 hover:bg-teal-500 text-white border-teal-400/50" variant="outline">
          View All Events
        </Button>
      </div>
    </div>
  );
};
