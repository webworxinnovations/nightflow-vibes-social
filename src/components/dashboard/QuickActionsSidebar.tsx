
import React from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Users, UserPlus, BarChart3, 
  Share, ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActionsSidebar = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};
