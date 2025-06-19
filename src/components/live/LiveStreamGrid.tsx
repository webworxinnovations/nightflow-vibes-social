
import { useLiveStreams } from "@/hooks/useLiveStreams";
import { LiveStreamCard } from "./LiveStreamCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";
import type { LiveStream } from "@/hooks/useLiveStreams";

interface LiveStreamGridProps {
  onWatchStream: (stream: LiveStream) => void;
}

export const LiveStreamGrid = ({ onWatchStream }: LiveStreamGridProps) => {
  const { liveStreams, isLoading, error } = useLiveStreams();

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load live streams. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (liveStreams.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
        <p className="text-muted-foreground">
          Check back later for live DJ performances!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {liveStreams.map(stream => (
        <LiveStreamCard
          key={stream.id}
          stream={stream}
          onWatch={onWatchStream}
        />
      ))}
    </div>
  );
};
