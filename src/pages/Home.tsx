import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { users, posts, getLiveEvents, getLiveDjs } from "@/lib/mock-data";
import { Event } from "@/hooks/useEvents";
import { LiveNowSection } from "@/components/home/LiveNowSection";
import { PopularDjsSidebar } from "@/components/home/PopularDjsSidebar";
import { TrendingGenresSidebar } from "@/components/home/TrendingGenresSidebar";
import { FeedSection } from "@/components/home/FeedSection";
import { UpcomingEventsSidebar } from "@/components/home/UpcomingEventsSidebar";
import { TipDropCard } from "@/components/home/TipDropCard";

// Transform mock events to match the Event interface
const transformMockEventToEvent = (mockEvent: any): Event => {
  // Handle invalid date/time values safely
  const createSafeDate = (date: string, time?: string) => {
    try {
      if (!date) return new Date().toISOString();
      
      // If time is provided, combine date and time
      if (time) {
        const dateTimeString = `${date}T${time}`;
        const dateObj = new Date(dateTimeString);
        return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
      }
      
      // If only date is provided, add default time
      const dateObj = new Date(`${date}T20:00:00`);
      return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
    } catch (error) {
      console.warn('Invalid date/time value:', { date, time }, error);
      return new Date().toISOString();
    }
  };

  const startTime = createSafeDate(mockEvent.date, mockEvent.time);
  const endTime = createSafeDate(mockEvent.date, '23:59');

  return {
    id: mockEvent.id,
    title: mockEvent.title,
    description: mockEvent.description || '',
    venue_name: mockEvent.venue,
    venue_address: mockEvent.address,
    start_time: startTime,
    end_time: endTime,
    cover_image_url: mockEvent.image,
    ticket_price: mockEvent.price,
    ticket_capacity: mockEvent.maxCapacity,
    tickets_sold: mockEvent.ticketsSold || 0,
    status: mockEvent.isLive ? 'live' : 'published',
    organizer_id: 'mock-organizer',
    stream_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Compatibility properties
    date: mockEvent.date,
    time: mockEvent.time,
    venue: mockEvent.venue,
    address: mockEvent.address,
    price: mockEvent.price,
    capacity: mockEvent.maxCapacity,
    attendees: mockEvent.ticketsSold,
    image: mockEvent.image,
    lineup: mockEvent.lineup || [],
    ticketsSold: mockEvent.ticketsSold,
    maxCapacity: mockEvent.maxCapacity,
    promoter: mockEvent.promoter?.name,
    isLive: mockEvent.isLive,
    vibe: mockEvent.vibe
  };
};

export default function Home() {
  const [liveDjs, setLiveDjs] = useState(getLiveDjs());
  const [liveEvents, setLiveEvents] = useState(getLiveEvents());
  
  // Transform live events to Event type
  const transformedLiveEvents: Event[] = liveEvents.map(transformMockEventToEvent);
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-white text-glow animate-float" style={{
        background: 'linear-gradient(45deg, #14b8a6, #06b6d4, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.6))'
      }}>NightFlow</h1>
      
      {/* Live Now Section */}
      <LiveNowSection 
        liveEvents={liveEvents}
        liveDjs={liveDjs}
        transformedLiveEvents={transformedLiveEvents}
      />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <PopularDjsSidebar />
          
          <Separator className="my-6 bg-teal-400/30" />
          
          <TrendingGenresSidebar />
        </div>
        
        {/* Feed */}
        <div className="lg:col-span-2">
          <FeedSection />
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block">
          <UpcomingEventsSidebar transformedLiveEvents={transformedLiveEvents} />
          
          <Separator className="my-6 bg-teal-400/30" />
          
          <TipDropCard />
        </div>
      </div>
    </div>
  );
}
