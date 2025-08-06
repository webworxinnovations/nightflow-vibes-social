
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { AlertTriangle, Globe, Copy } from "lucide-react";
import { toast } from "sonner";

export const HttpAccessHelper = () => {
  return (
    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-green-400" />
        <p className="text-green-400 font-medium">✅ HTTPS Streaming Ready!</p>
      </div>
      <p className="text-green-300 text-sm mt-1">
        Your droplet server is configured for HTTPS-only streaming. OBS can connect to RTMP while the stream plays over HTTPS.
      </p>
      <div className="text-xs text-green-200 mt-2 space-y-1">
        <p>• OBS RTMP: rtmp://67.205.179.77:1935/live</p>
        <p>• Stream playback: HTTPS (secure)</p>
        <p>• No mixed content issues</p>
      </div>
    </div>
  );
};
