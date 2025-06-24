
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
      <GlassmorphicCard className="glassmorphism">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Total Tips</h3>
          <DollarSign className="h-5 w-5 text-teal-600" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">${earnings}</p>
        <p className="mt-1 text-xs text-gray-500">+$50 from last week</p>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="glassmorphism">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
          <Music className="h-5 w-5 text-gray-600" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{totalRequests}</p>
        <p className="mt-1 text-xs text-gray-500">
          {acceptedRequests} accepted
        </p>
      </GlassmorphicCard>
      
      <GlassmorphicCard className="glassmorphism">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Upcoming Events</h3>
          <Calendar className="h-5 w-5 text-gray-600" />
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
        <p className="mt-1 text-xs text-gray-500">
          Next: {upcomingEvents[0] ? formatDate(upcomingEvents[0].date) : 'None'}
        </p>
      </GlassmorphicCard>
    </div>
  );
};
