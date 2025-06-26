
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { RTMPDiagnostics } from "./RTMPDiagnostics";
import { ServerStatusAlert } from "./ServerStatusAlert";
import { ProfessionalStreamSetup } from "./ProfessionalStreamSetup";
import { LiveStreamStatsHeader } from "./LiveStreamStatsHeader";
import { 
  Key, 
  Trash2,
  Play,
  Monitor
} from "lucide-react";

interface StreamConfigurationPanelProps {
  streamConfig: { 
    rtmpUrl: string; 
    streamKey: string; 
    hlsUrl: string 
  } | null;
  isLive: boolean;
  viewerCount: number;
  duration: number;
  bitrate: number;
  isLoading: boolean;
  serverAvailable: boolean;
  onGenerateKey: () => void;
  onRevokeKey: () => void;
}

export const StreamConfigurationPanel = ({
  streamConfig,
  isLive,
  viewerCount,
  duration,
  bitrate,
  isLoading,
  serverAvailable,
  onGenerateKey,
  onRevokeKey
}: StreamConfigurationPanelProps) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            Professional Stream Configuration
          </h3>
          
          <LiveStreamStatsHeader 
            isLive={isLive}
            viewerCount={viewerCount}
            duration={duration}
            bitrate={bitrate}
          />
        </div>

        <ServerStatusAlert serverAvailable={serverAvailable} />

        {streamConfig ? (
          <>
            <ProfessionalStreamSetup streamKey={streamConfig.streamKey} />

            {/* Advanced Diagnostics (Optional) */}
            <div className="flex items-center justify-between p-3 bg-slate-500/10 border border-slate-500/20 rounded-lg mt-4">
              <div>
                <h4 className="font-medium">Advanced Diagnostics</h4>
                <p className="text-sm text-muted-foreground">
                  Optional: Technical connection testing tools
                </p>
              </div>
              <Button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                variant="outline"
                size="sm"
              >
                {showDiagnostics ? 'Hide' : 'Show'} Advanced Tools
              </Button>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={onGenerateKey}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate New Stream Key'}
              </Button>
              <Button
                onClick={onRevokeKey}
                variant="destructive"
                size="sm"
                disabled={isLive}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">Ready for Professional Streaming</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your universal stream configuration - works with any ISP
            </p>
            <Button 
              onClick={onGenerateKey} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? 'Setting up...' : 'Generate Professional Stream Setup'}
            </Button>
          </div>
        )}
      </GlassmorphicCard>

      {/* Advanced Diagnostics Panel */}
      {showDiagnostics && streamConfig && (
        <RTMPDiagnostics
          rtmpUrl={streamConfig.rtmpUrl}
          serverUrl="https://nightflow-app-wijb2.ondigitalocean.app"
          streamKey={streamConfig.streamKey}
        />
      )}
    </div>
  );
};
