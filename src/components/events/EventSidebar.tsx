
import { Link } from "react-router-dom";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ticket } from "lucide-react";
import { formatDate } from "@/lib/mock-data";

interface Event {
  id: string;
  title: string;
  image: string;
  date: string;
  venue: string;
  price: number;
  ticketsSold: number;
  maxCapacity: number;
  vibe?: number;
  isLive?: boolean;
}

interface EventSidebarProps {
  event: Event;
  similarEvents: Event[];
}

export function EventSidebar({ event, similarEvents }: EventSidebarProps) {
  return (
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
          {similarEvents.map((similarEvent) => (
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
  );
}
