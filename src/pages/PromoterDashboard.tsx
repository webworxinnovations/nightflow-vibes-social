
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useAuth } from "@/contexts/AuthContext";
import { useSubPromoters } from "@/contexts/SubPromoterContext";
import { users, Event } from "@/lib/mock-data";
import { usePromoterEvents } from "@/hooks/usePromoterEvents";
import { useSelectedEvent } from "@/hooks/useSelectedEvent";

// Import refactored components
import { AnalyticsCards } from "@/components/dashboard/AnalyticsCards";
import { EventsTabs } from "@/components/dashboard/EventsTabs";
import { EventManagementCard } from "@/components/dashboard/EventManagementCard";
import { ActiveEventSidebar } from "@/components/dashboard/ActiveEventSidebar";
import { QuickActionsSidebar } from "@/components/dashboard/QuickActionsSidebar";
import { FeaturedDJsSidebar } from "@/components/dashboard/FeaturedDJsSidebar";

export default function PromoterDashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const { currentUser } = useAuth();
  const { getSubPromotersForPromoter } = useSubPromoters();
  const { promoterEvents, promoterId } = usePromoterEvents();
  const { selectedEventId, setSelectedEventId } = useSelectedEvent();
  
  // Get sub-promoters for this promoter from our context
  const mySubPromoters = getSubPromotersForPromoter(promoterId);
  
  // Guest lists
  const guestLists = [
    { name: "VIP List", count: 45, total: 50 },
    { name: "Artist List", count: 12, total: 15 },
    { name: "Press List", count: 8, total: 10 }
  ];
  
  // Active event (first event)
  const activeEvent = promoterEvents[0];
  
  // Mock analytics data
  const analytics = {
    totalAttendees: 3250,
    totalRevenue: 12480,
    averageAge: 27,
    genderRatio: { male: 52, female: 48 }
  };

  // Calculate total tickets sold by sub-promoters
  const subPromoterTicketsSold = mySubPromoters.reduce(
    (acc, curr) => acc + curr.ticketsSold, 0
  );
  
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Promoter Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {/* Analytics Cards */}
          <AnalyticsCards
            analytics={analytics}
            subPromoterCount={mySubPromoters.length}
            subPromoterTicketsSold={subPromoterTicketsSold}
          />
          
          {/* Events Tabs */}
          <EventsTabs events={promoterEvents} />
          
          {/* Event Management Card */}
          <EventManagementCard
            selectedEventId={selectedEventId}
            guestLists={guestLists}
            subPromoters={mySubPromoters}
          />
        </div>
        
        <div>
          {/* Active Event Sidebar */}
          <ActiveEventSidebar activeEvent={activeEvent} />
          
          {/* Quick Actions Sidebar */}
          <QuickActionsSidebar />
          
          {/* Featured DJs Sidebar */}
          <FeaturedDJsSidebar djs={users} />
        </div>
      </div>
    </div>
  );
}
