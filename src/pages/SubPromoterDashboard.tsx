
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CreditCard, QrCode, Ticket, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubPromoters } from "@/contexts/SubPromoterContext";
import { SubPromoterEventsTable } from "@/components/subpromoter/SubPromoterEventsTable";
import { SubPromoterPerformanceChart } from "@/components/subpromoter/SubPromoterPerformanceChart";
import { SubPromoterQrCodeDialog } from "@/components/subpromoter/SubPromoterQrCodeDialog";

export default function SubPromoterDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Mock data for sub-promoter dashboard
  const subPromoterData = {
    name: currentUser?.name || "Sub-Promoter",
    eventsCount: 5,
    totalTicketsSold: 47,
    totalRevenue: 1880,
    commission: 376,  // 20% commission
    upcomingEvents: 3
  };
  
  // Mock performance data by date
  const performanceData = [
    { date: "1 May", tickets: 8, revenue: 320 },
    { date: "8 May", tickets: 12, revenue: 480 },
    { date: "15 May", tickets: 15, revenue: 600 },
    { date: "22 May", tickets: 12, revenue: 480 },
  ];
  
  // Mock upcoming events
  const upcomingEvents = [
    { id: "e1", name: "Summer Beach Bash", date: "2025-06-15", ticketsSold: 18, totalTickets: 25, commission: "$144" },
    { id: "e2", name: "Techno Night", date: "2025-06-22", ticketsSold: 14, totalTickets: 30, commission: "$112" },
    { id: "e3", name: "Hip-Hop Festival", date: "2025-07-05", ticketsSold: 15, totalTickets: 25, commission: "$120" },
  ];
  
  const showQrCode = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsQrDialogOpen(true);
  };
  
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Sub-Promoter Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Tickets Sold</h3>
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold">{subPromoterData.totalTicketsSold}</p>
              <p className="mt-1 text-xs text-muted-foreground">Across {subPromoterData.eventsCount} events</p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">${subPromoterData.totalRevenue}</p>
              <p className="mt-1 text-xs text-muted-foreground">From all ticket sales</p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Commission</h3>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">${subPromoterData.commission}</p>
              <p className="mt-1 text-xs text-muted-foreground">Your earnings</p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{subPromoterData.upcomingEvents}</p>
              <p className="mt-1 text-xs text-muted-foreground">Events to promote</p>
            </GlassmorphicCard>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <SubPromoterPerformanceChart data={performanceData} />
                </TabsContent>
                
                <TabsContent value="events" className="mt-4">
                  <SubPromoterEventsTable events={upcomingEvents} onShowQrCode={showQrCode} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <GlassmorphicCard>
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || ''} />
                <AvatarFallback>{currentUser?.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mb-1">{currentUser?.name || 'Sub-Promoter'}</h2>
              <p className="text-sm text-muted-foreground mb-3">@{currentUser?.username || 'username'}</p>
              <Badge variant="secondary" className="mb-4">Sub-Promoter</Badge>
              
              <div className="w-full space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Monthly Target</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full text-left flex justify-between" onClick={() => setIsQrDialogOpen(true)}>
                <span className="flex items-center">
                  <QrCode className="mr-2 h-4 w-4" />
                  Share My QR Code
                </span>
              </Button>
              <Button variant="outline" className="w-full text-left flex justify-between">
                <span className="flex items-center">
                  <Ticket className="mr-2 h-4 w-4" />
                  View All Tickets
                </span>
              </Button>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h3 className="text-lg font-medium mb-4">Tips for Promoters</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                  <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <span>Share your unique code on social media</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                  <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <span>Create targeted promotions for each event</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                  <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <span>Follow up with interested prospects</span>
              </li>
            </ul>
          </GlassmorphicCard>
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <SubPromoterQrCodeDialog 
        isOpen={isQrDialogOpen}
        onOpenChange={setIsQrDialogOpen}
        eventId={selectedEventId || ''}
      />
    </div>
  );
}
