
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LiveStreamManager } from "@/components/dj/LiveStreamManager";
import { DjStatsCards } from "@/components/dashboard/DjStatsCards";
import { RequestsHeader } from "@/components/dashboard/RequestsHeader";
import { RequestsTabsContent } from "@/components/dashboard/RequestsTabsContent";
import { DjSidebar } from "@/components/dashboard/DjSidebar";
import { songRequests, events } from "@/lib/mock-data";

export default function DjDashboard() {
  const [requests, setRequests] = useState(songRequests);
  const [earnings, setEarnings] = useState(
    requests.filter(req => req.status === 'accepted').reduce((sum, req) => sum + req.tipAmount, 0)
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredRequests = requests.filter(req => {
    return req.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           req.song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
           req.fan.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleAccept = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'accepted' } : req
    ));
    
    const acceptedRequest = requests.find(req => req.id === id);
    if (acceptedRequest) {
      setEarnings(earnings + acceptedRequest.tipAmount);
    }
  };
  
  const handleDecline = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'declined' } : req
    ));
  };
  
  const djEvents = events.slice(0, 2);
  
  return (
    <div className="p-6 min-h-screen text-white">
      <h1 className="mb-6 text-3xl font-bold text-white drop-shadow-[0_0_12px_rgba(20,184,166,0.8)]" style={{
        background: 'linear-gradient(45deg, #14b8a6, #06b6d4, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.6))'
      }}>DJ Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <DjStatsCards 
            earnings={earnings}
            totalRequests={requests.length}
            acceptedRequests={requests.filter(r => r.status === 'accepted').length}
            upcomingEvents={djEvents}
          />
          
          {/* Live Stream Manager - Now showing the full test setup */}
          <div className="mt-6 mb-6">
            <LiveStreamManager />
          </div>
          
          <Tabs defaultValue="live" className="mt-6">
            <RequestsHeader 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            
            <RequestsTabsContent
              filteredRequests={filteredRequests}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          </Tabs>
        </div>
        
        <DjSidebar requests={requests} djEvents={djEvents} />
      </div>
    </div>
  );
}
