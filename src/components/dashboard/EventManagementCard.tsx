
import React, { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SubPromotersList } from "@/components/promoter/SubPromotersList";
import { SubPromoterSalesChart } from "@/components/promoter/SubPromoterSalesChart";
import { SubPromoter } from "@/lib/mock-data";
import { EventSelector } from "./EventSelector";
import { GuestCheckInQR } from "./GuestCheckInQR";

interface EventManagementCardProps {
  selectedEventId: string;
  guestLists: { name: string; count: number; total: number }[];
  subPromoters: SubPromoter[];
}

export const EventManagementCard = ({
  selectedEventId,
  guestLists,
  subPromoters
}: EventManagementCardProps) => {
  const [activeTab, setActiveTab] = useState("guest-list");
  const [currentEventId, setCurrentEventId] = useState(selectedEventId);
  
  return (
    <GlassmorphicCard className="mt-6">
      <Tabs defaultValue="guest-list" onValueChange={(value) => setActiveTab(value)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {activeTab === "guest-list" ? "Guest List Management" : "Sub-Promoter Management"}
          </h2>
          <EventSelector 
            selectedEventId={currentEventId} 
            onChange={setCurrentEventId} 
          />
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
          
          <GuestCheckInQR />
        </TabsContent>
        
        <TabsContent value="sub-promoters" className="mt-4">
          <SubPromotersList 
            subPromoters={subPromoters} 
            eventId={currentEventId} 
          />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <SubPromoterSalesChart eventId={currentEventId} />
        </TabsContent>
      </Tabs>
    </GlassmorphicCard>
  );
};
