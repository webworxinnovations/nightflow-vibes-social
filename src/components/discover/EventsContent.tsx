
import { EventCard } from "@/components/cards/event-card";
import { Event } from "@/hooks/useEvents";

interface EventsContentProps {
  filteredEvents: Event[];
}

export function EventsContent({ filteredEvents }: EventsContentProps) {
  return (
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
  );
}
