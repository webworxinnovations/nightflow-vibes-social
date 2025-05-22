
import React from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { BarChart3, Users, UserPlus } from "lucide-react";

interface AnalyticsCardsProps {
  analytics: {
    totalRevenue: number;
    totalAttendees: number;
  };
  subPromoterCount: number;
  subPromoterTicketsSold: number;
}

export const AnalyticsCards = ({
  analytics,
  subPromoterCount,
  subPromoterTicketsSold
}: AnalyticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <GlassmorphicCard className="bg-primary/10 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-2 text-3xl font-bold">${analytics.totalRevenue}</p>
        <p className="mt-1 text-xs text-muted-foreground">+$2,450 from last month</p>
      </GlassmorphicCard>
      
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Attendees</h3>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-2 text-3xl font-bold">{analytics.totalAttendees}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Across many events
        </p>
      </GlassmorphicCard>
      
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Sub-Promoters</h3>
          <UserPlus className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-2 text-3xl font-bold">{subPromoterCount}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {subPromoterTicketsSold} tickets sold
        </p>
      </GlassmorphicCard>
    </div>
  );
};
