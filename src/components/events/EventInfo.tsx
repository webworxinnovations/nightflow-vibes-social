
import { Link } from "react-router-dom";
import { useState } from "react";
import { Flame } from "lucide-react";
import { Share, QrCode } from "lucide-react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Promoter {
  id: string;
  name: string;
  avatar: string;
}

interface EventInfoProps {
  description: string;
  promoter: Promoter;
  isLive: boolean;
  vibe?: number;
  onVibeChange?: (vibe: number) => void;
}

export function EventInfo({ 
  description, 
  promoter, 
  isLive, 
  vibe = 0,
  onVibeChange 
}: EventInfoProps) {
  return (
    <>
      <GlassmorphicCard>
        <h2 className="text-xl font-semibold">About the Event</h2>
        <p className="mt-4 text-muted-foreground">{description}</p>
        
        <Separator className="my-6 bg-white/10" />
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium">Promoter</h3>
            <div className="mt-2 flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={promoter.avatar} alt={promoter.name} />
                <AvatarFallback>{promoter.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Link 
                to={`/profile/${promoter.id}`}
                className="ml-2 text-sm hover:text-primary"
              >
                {promoter.name}
              </Link>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Button>
          </div>
        </div>
      </GlassmorphicCard>
      
      {isLive && (
        <GlassmorphicCard className="mt-6">
          <h2 className="text-xl font-semibold">Live Event Vibes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            How's the crowd energy? Rate the vibes!
          </p>
          
          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                className="transition-transform hover:scale-125"
                onClick={() => onVibeChange && onVibeChange(i + 1)}
              >
                <Flame
                  className={`h-8 w-8 ${
                    i < vibe ? "text-orange-500" : "text-gray-400"
                  }`}
                />
              </button>
            ))}
          </div>
          
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              style={{ width: `${(vibe / 5) * 100}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Chill</span>
            <span>Fire</span>
          </div>
        </GlassmorphicCard>
      )}
    </>
  );
}
