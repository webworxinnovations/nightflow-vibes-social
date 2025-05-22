import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { EventCard } from "@/components/cards/event-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubPromoters } from "@/contexts/SubPromoterContext";
import { 
  Calendar, Users, Ticket, Plus, BarChart3, QrCode, ChevronRight, 
  ArrowUpRight, Search, Share, UserPlus
} from "lucide-react";
import { 
  events, users, getEventsByPromoter,
  getSubPromoterSalesByEventId
} from "@/lib/mock-data";
import { SubPromotersList } from "@/components/promoter/SubPromotersList";
import { SubPromoterSalesChart } from "@/components/promoter/SubPromoterSalesChart";

export default function PromoterDashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id);
  const { currentUser } = useAuth();
  const { getSubPromotersForPromoter } = useSubPromoters();
  const navigate = useNavigate();
  
  // If we have a logged-in promoter, get their events
  // Otherwise use mock data
  const promoterId = currentUser?.id || "6"; // Default to mock promoter if not logged in
  const promoterEvents = getEventsByPromoter(promoterId);
  
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
  
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Promoter Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
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
                Across {promoterEvents.length} events
              </p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Sub-Promoters</h3>
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{mySubPromoters.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mySubPromoters.reduce((acc, curr) => acc + curr.ticketsSold, 0)} tickets sold
              </p>
            </GlassmorphicCard>
          </div>
          
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Events</h2>
              <Button onClick={() => navigate('/create-event')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
            
            <Tabs defaultValue="upcoming" className="mt-4">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="live">Live Now</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {promoterEvents
                    .filter(event => !event.isLive)
                    .map(event => (
                      <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="live" className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {promoterEvents
                    .filter(event => event.isLive)
                    .map(event => (
                      <EventCard key={event.id} event={event} />
                  ))}
                  
                  {promoterEvents.filter(event => event.isLive).length === 0 && (
                    <div className="col-span-2 py-12 text-center">
                      <h3 className="text-lg font-semibold">No live events</h3>
                      <p className="text-muted-foreground">
                        You don't have any events that are currently live
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="past" className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {promoterEvents.slice(0, 2).map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <GlassmorphicCard className="mt-6">
            <Tabs defaultValue="guest-list" onValueChange={(value) => setActiveTab(value)}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {activeTab === "guest-list" ? "Guest List Management" : "Sub-Promoter Management"}
                </h2>
                <Select
                  placeholder="Select event"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  {promoterEvents.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </Select>
              </div>
              
              <TabsList>
                <TabsTrigger value="guest-list">Guest Lists</TabsTrigger>
                <TabsTrigger value="sub-promoters">Sub-Promoters</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guest-list" className="mt-4">
                <div className="mb-2 flex items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search guests..."
                      className="pl-9"
                    />
                  </div>
                  <Button className="ml-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Guest
                  </Button>
                </div>
                
                <div className="mt-4 space-y-4">
                  {guestLists.map((list, index) => (
                    <div key={index}>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium">{list.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {list.count}/{list.total} checked in
                        </span>
                      </div>
                      <Progress value={(list.count / list.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 rounded-md border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Guest Check-in QR Code</h3>
                      <p className="text-sm text-muted-foreground">
                        Share this QR code for quick guest check-in
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sub-promoters" className="mt-4">
                <SubPromotersList 
                  subPromoters={mySubPromoters} 
                  eventId={selectedEventId} 
                />
              </TabsContent>
              
              <TabsContent value="performance" className="mt-4">
                <SubPromoterSalesChart eventId={selectedEventId} />
              </TabsContent>
            </Tabs>
          </GlassmorphicCard>
        </div>
        
        <div>
          <GlassmorphicCard>
            <h2 className="text-xl font-semibold">Active Event</h2>
            
            {activeEvent?.isLive ? (
              <div className="mt-4">
                <div className="relative mb-3 overflow-hidden rounded-md">
                  <img
                    src={activeEvent.image}
                    alt={activeEvent.title}
                    className="w-full"
                  />
                  <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    LIVE NOW
                  </div>
                </div>
                
                <h3 className="font-semibold">{activeEvent.title}</h3>
                <p className="text-sm text-muted-foreground">{activeEvent.venue}</p>
                
                <div className="mt-3 flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Attendees</p>
                    <p className="font-medium">
                      {activeEvent.ticketsSold}/{activeEvent.maxCapacity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-medium">
                      ${activeEvent.ticketsSold * activeEvent.price}
                    </p>
                  </div>
                </div>
                
                <Button className="mt-4 w-full">View Event Dashboard</Button>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 font-medium">No Live Events</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any events live right now
                </p>
                <Button className="mt-4 w-full" variant="outline">
                  Start an Event
                </Button>
              </div>
            )}
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/create-event')}>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Event
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Guest Lists
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Sub-Promoters
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Share className="mr-2 h-4 w-4" />
                  Share Event
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Featured DJs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Popular DJs for your next event
            </p>
            
            <div className="mt-4 space-y-3">
              {users
                .filter(user => user.role === 'dj')
                .slice(0, 3)
                .map(dj => (
                  <div key={dj.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={dj.avatar} alt={dj.name} />
                        <AvatarFallback>{dj.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{dj.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dj.genres?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}

// Simple Select component for the dashboard
function Select({ 
  placeholder, 
  value, 
  onChange, 
  children 
}: { 
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select 
      className="rounded-md border border-white/10 bg-background px-3 py-1 text-sm"
      value={value}
      onChange={onChange}
    >
      <option value="" disabled>{placeholder}</option>
      {children}
    </select>
  );
}
