
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Event } from "@/hooks/useEvents";
import { formatDate } from "@/lib/mock-data";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  event: Event;
  className?: string;
  compact?: boolean;
}

export function EventCard({ event, className, compact = false }: EventCardProps) {
  return (
    <GlassmorphicCard 
      className={cn("w-full overflow-hidden", className)} 
      hoverEffect
    >
      <Link to={`/events/${event.id}`}>
        <div className="relative">
          <img
            src={event.image || event.cover_image_url}
            alt={event.title}
            className="h-48 w-full rounded-md object-cover"
          />
          {event.isLive && (
            <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              LIVE NOW
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            ${event.price || event.ticket_price || 0}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {event.date ? formatDate(event.date) : new Date(event.start_time).toLocaleDateString()} • {event.time || new Date(event.start_time).toLocaleTimeString()}
          </div>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            {event.venue || event.venue_name}
          </div>
          
          {!compact && (
            <>
              <div className="mt-3 flex -space-x-2">
                {event.lineup && event.lineup.slice(0, 3).map((dj, index) => (
                  <Avatar key={index} className="border-2 border-background">
                    <AvatarImage src={dj.avatar} alt={dj.name} />
                    <AvatarFallback>{dj.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {event.lineup && event.lineup.length > 3 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{event.lineup.length - 3}
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Button className="w-full">Get Tickets</Button>
              </div>
            </>
          )}
        </div>
      </Link>
    </GlassmorphicCard>
  );
}
