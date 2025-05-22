
import React from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight } from "lucide-react";

interface DJ {
  id: string;
  name: string;
  avatar: string;
  role: string;
  genres?: string[];
}

interface FeaturedDJsSidebarProps {
  djs: DJ[];
}

export const FeaturedDJsSidebar = ({ djs }: FeaturedDJsSidebarProps) => {
  return (
    <GlassmorphicCard className="mt-6">
      <h2 className="text-xl font-semibold">Featured DJs</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Popular DJs for your next event
      </p>
      
      <div className="mt-4 space-y-3">
        {djs
          .filter(dj => dj.role === 'dj')
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
  );
};
