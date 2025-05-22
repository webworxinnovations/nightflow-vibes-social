
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { ArrowLeft, Search, UserPlus, Ticket, Download, Share } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  subPromoters, events, getSubPromotersByParentId, 
  getEventsByPromoter, getSubPromoterSalesByPromoterId,
  subPromoterSales
} from "@/lib/mock-data";
import { SubPromotersList } from "@/components/promoter/SubPromotersList";
import { SubPromoterSalesChart } from "@/components/promoter/SubPromoterSalesChart";
import { useAuth } from "@/contexts/AuthContext";

export default function SubPromoterManagement() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  
  // Mock promoter ID (would come from auth in a real app)
  const promoterId = currentUser?.id || "6"; // Default to Nightlife Productions
  
  // Get all events for this promoter
  const promoterEvents = getEventsByPromoter(promoterId);
  
  // Get all sub-promoters for this promoter
  const mySubPromoters = getSubPromotersByParentId(promoterId);
  
  // Only set default event if not already set and we have events
  if (!selectedEventId && promoterEvents.length > 0) {
    setSelectedEventId(promoterEvents[0].id);
  }
  
  // Calculate total stats
  const totalTicketsSold = mySubPromoters.reduce((acc, curr) => acc + curr.ticketsSold, 0);
  
  // Get all sales for the selected event and promoter's sub-promoters
  const eventSubPromoterSales = selectedEventId 
    ? subPromoterSales.filter(sale => 
        sale.eventId === selectedEventId && 
        mySubPromoters.some(sp => sp.id === sale.subPromoterId)
      )
    : [];
  
  const totalEventRevenue = eventSubPromoterSales.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Sub-Promoter Management</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <GlassmorphicCard>
              <h3 className="text-sm font-medium text-muted-foreground">Sub-Promoters</h3>
              <p className="mt-2 text-3xl font-bold">{mySubPromoters.length}</p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <h3 className="text-sm font-medium text-muted-foreground">Total Tickets Sold</h3>
              <p className="mt-2 text-3xl font-bold">{totalTicketsSold}</p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <h3 className="text-sm font-medium text-muted-foreground">Selected Event Revenue</h3>
              <p className="mt-2 text-3xl font-bold">
                ${totalEventRevenue}
              </p>
            </GlassmorphicCard>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Sub-Promoters</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sub-promoters..."
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Sub-Promoter
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Sub-Promoters</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium">Select Event</h3>
                    <select 
                      className="rounded-md border border-white/10 bg-background px-3 py-1 text-sm"
                      value={selectedEventId} 
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      <option value="" disabled>Select an event</option>
                      {promoterEvents.map(event => (
                        <option key={event.id} value={event.id}>{event.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedEventId && (
                    <SubPromotersList 
                      subPromoters={mySubPromoters}
                      eventId={selectedEventId}
                    />
                  )}
                </TabsContent>
                <TabsContent value="active" className="mt-4">
                  <p className="text-center text-muted-foreground py-8">
                    Active sub-promoters will appear here
                  </p>
                </TabsContent>
                <TabsContent value="inactive" className="mt-4">
                  <p className="text-center text-muted-foreground py-8">
                    Inactive sub-promoters will appear here
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {selectedEventId && (
            <SubPromoterSalesChart eventId={selectedEventId} />
          )}
        </div>
        
        <div>
          <GlassmorphicCard>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Sub-Promoter
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Ticket className="mr-2 h-4 w-4" />
                  Track Sales
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Share className="mr-2 h-4 w-4" />
                  Share Tracking Link
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Export Reports
                </div>
              </Button>
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Top Performers</h2>
            <div className="mt-4 space-y-4">
              {mySubPromoters
                .sort((a, b) => b.ticketsSold - a.ticketsSold)
                .slice(0, 3)
                .map((promoter, index) => (
                  <div key={promoter.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 w-7 h-7 rounded-full flex items-center justify-center mr-3">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{promoter.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {promoter.ticketsSold} tickets sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${promoter.ticketsSold * 45}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
