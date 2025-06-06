
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Music, Ticket, Users } from "lucide-react";
import { songs, formatDate } from "@/lib/mock-data";

interface DjSidebarProps {
  requests: Array<{
    id: string;
    status: 'pending' | 'accepted' | 'declined';
    [key: string]: any;
  }>;
  djEvents: Array<{
    id: string;
    title: string;
    venue: string;
    date: string;
    ticketsSold: number;
    maxCapacity: number;
    lineup: Array<any>;
  }>;
}

export const DjSidebar = ({ requests, djEvents }: DjSidebarProps) => {
  return (
    <div>
      <GlassmorphicCard>
        <h2 className="text-xl font-semibold">Song Requests</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Receive song requests with tips from fans at your events
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Request Status</span>
            <span className="text-sm font-medium">
              {requests.filter(r => r.status === 'pending').length} Pending
            </span>
          </div>
          
          <div className="h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-primary"
              style={{ 
                width: `${(requests.filter(r => r.status === 'accepted').length / requests.length) * 100}%` 
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {requests.filter(r => r.status === 'accepted').length} Accepted
            </span>
            <span>
              {requests.filter(r => r.status === 'declined').length} Declined
            </span>
          </div>
        </div>
        
        <Button className="mt-6 w-full">
          <Music className="mr-2 h-4 w-4" />
          Generate QR Code
        </Button>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="mt-6">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <div className="mt-4 space-y-4">
          {djEvents.map(event => (
            <div key={event.id} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-primary/10 text-center">
                  <span className="text-sm font-bold">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.venue}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Ticket className="mr-1 h-3 w-3" />
                    {event.ticketsSold}/{event.maxCapacity}
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    {event.lineup.length} DJs
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="mt-6">
        <h2 className="text-xl font-semibold">Recently Requested</h2>
        <div className="mt-4 space-y-3">
          {songs.slice(0, 3).map((song) => (
            <div key={song.id} className="flex items-center gap-3">
              <img
                src={song.albumArt}
                alt={song.title}
                className="h-10 w-10 rounded object-cover"
              />
              <div>
                <p className="text-sm font-medium">{song.title}</p>
                <p className="text-xs text-muted-foreground">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
