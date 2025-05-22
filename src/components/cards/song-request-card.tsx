
import { SongRequest, formatTimeAgo } from "@/lib/mock-data";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface SongRequestCardProps {
  request: SongRequest;
  className?: string;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function SongRequestCard({ 
  request, 
  className,
  onAccept,
  onDecline 
}: SongRequestCardProps) {
  return (
    <GlassmorphicCard className={className}>
      <div className="flex items-start gap-3">
        <img 
          src={request.song.albumArt} 
          alt={`${request.song.title} album art`}
          className="h-16 w-16 rounded-md object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{request.song.title}</h3>
          <p className="text-sm text-muted-foreground">{request.song.artist}</p>
          
          <div className="mt-2 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.fan.avatar} alt={request.fan.name} />
              <AvatarFallback>{request.fan.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {request.fan.name} • <span className="text-primary">${request.tipAmount}</span>
            </span>
          </div>
          
          {request.message && (
            <p className="mt-2 text-sm italic text-muted-foreground">"{request.message}"</p>
          )}
        </div>
      </div>
      
      {request.status === 'pending' && (
        <div className="mt-3 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-500"
            onClick={() => onAccept?.(request.id)}
          >
            <Check className="mr-1 h-4 w-4" />
            Accept
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => onDecline?.(request.id)}
          >
            <X className="mr-1 h-4 w-4" />
            Decline
          </Button>
        </div>
      )}
      
      {request.status === 'accepted' && (
        <div className="mt-3">
          <div className="rounded-md bg-green-500/20 p-2 text-center text-sm text-green-500">
            Accepted • {formatTimeAgo(request.timestamp)}
          </div>
        </div>
      )}
      
      {request.status === 'declined' && (
        <div className="mt-3">
          <div className="rounded-md bg-red-500/20 p-2 text-center text-sm text-red-500">
            Declined • {formatTimeAgo(request.timestamp)}
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
}
