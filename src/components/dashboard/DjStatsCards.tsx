
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { DollarSign, Music, Calendar } from "lucide-react";
import { formatDate } from "@/lib/mock-data";

interface DjStatsCardsProps {
  earnings: number;
  totalRequests: number;
  acceptedRequests: number;
  upcomingEvents: Array<{ date: string }>;
}

export const DjStatsCards = ({ 
  earnings, 
  totalRequests, 
  acceptedRequests, 
  upcomingEvents 
}: DjStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <GlassmorphicCard className="bg-primary/10 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tips</h3>
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 text-3xl font-bold">${earnings}</p>
        <p className="mt-1 text-xs text-muted-foreground">+$50 from last week</p>
      </GlassmorphicCard>
      
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
          <Music className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-2 text-3xl font-bold">{totalRequests}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {acceptedRequests} accepted
        </p>
      </GlassmorphicCard>
      
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Upcoming Events</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-2 text-3xl font-bold">{upcomingEvents.length}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Next: {upcomingEvents[0] ? formatDate(upcomingEvents[0].date) : 'None'}
        </p>
      </GlassmorphicCard>
    </div>
  );
};
