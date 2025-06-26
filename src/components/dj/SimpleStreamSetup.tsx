
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";
import { OBSConnectionManager } from "./OBSConnectionManager";

export const SimpleStreamSetup = () => {
  const { streamConfig, isLoading, generateStreamKey, revokeStreamKey, isLive, viewerCount } = useRealTimeStream();

  const handleGenerateKey = async () => {
    try {
      await generateStreamKey();
      toast.success('✅ Professional stream setup ready! Follow the OBS instructions below.');
    } catch (error) {
      toast.error('Failed to generate stream configuration');
    }
  };

  const handleRevokeKey = async () => {
    try {
      await revokeStreamKey();
      toast.info('Stream configuration removed');
    } catch (error) {
      toast.error('Failed to revoke stream configuration');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Professional OBS Streaming</h2>
        <p className="text-muted-foreground">
          Elite-grade streaming configuration optimized for OBS Studio
        </p>
      </div>

      {streamConfig ? (
        <div className="space-y-6">
          {/* Live Status */}
          {isLive && (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-medium text-lg">LIVE • {viewerCount} viewers</span>
            </div>
          )}

          {/* OBS Connection Manager */}
          <OBSConnectionManager 
            streamKey={streamConfig.streamKey}
            onTestConnection={() => console.log('Connection tested')}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateKey}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate New Configuration'}
            </Button>
            <Button
              onClick={handleRevokeKey}
              variant="destructive"
              size="sm"
              disabled={isLive || isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <GlassmorphicCard>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="font-medium mb-2 text-xl">Elite Streaming Configuration</h4>
            <p className="text-muted-foreground mb-6">
              Generate your professional streaming setup with automatic RTMP server testing
            </p>
            <Button 
              onClick={handleGenerateKey} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              {isLoading ? 'Setting up...' : 'Generate Elite Stream Configuration'}
            </Button>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};
