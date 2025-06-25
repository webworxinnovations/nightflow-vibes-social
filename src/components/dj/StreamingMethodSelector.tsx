
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrowserStreamingSetup } from "./BrowserStreamingSetup";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Camera, Settings, Wifi } from "lucide-react";
import { OBSSetupInstructions } from "./OBSSetupInstructions";
import { StreamingConfig } from "@/services/streaming/config";

interface StreamingMethodSelectorProps {
  streamKey: string;
  onStreamStatusChange?: (isLive: boolean) => void;
}

export const StreamingMethodSelector = ({ streamKey, onStreamStatusChange }: StreamingMethodSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("browser");
  const obsServerUrl = StreamingConfig.getOBSServerUrl();

  return (
    <div className="space-y-6">
      {/* Railway RTMP Issue Alert */}
      <GlassmorphicCard>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-400 mb-2">Railway RTMP Limitation Detected</h4>
              <p className="text-sm text-amber-300 mb-3">
                Railway successfully started the RTMP server internally, but doesn't expose port 1935 
                externally for OBS connections. This is a common limitation of cloud platforms.
              </p>
              <div className="text-xs text-amber-300/80">
                ✅ RTMP Server: Running internally<br/>
                ❌ Port 1935: Not accessible externally<br/>
                💡 Solution: Use HTTP-based streaming methods below
              </div>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Streaming Method Tabs */}
      <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browser" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Browser Streaming
            <Badge variant="secondary" className="ml-1 text-xs">Recommended</Badge>
          </TabsTrigger>
          <TabsTrigger value="obs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            OBS (Limited)
            <Badge variant="destructive" className="ml-1 text-xs">Port Issue</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browser" className="mt-6">
          <BrowserStreamingSetup 
            streamKey={streamKey} 
            onStreamStatusChange={onStreamStatusChange}
          />
        </TabsContent>

        <TabsContent value="obs" className="mt-6">
          <div className="space-y-4">
            {/* OBS Issue Warning */}
            <GlassmorphicCard>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Wifi className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-400 mb-2">OBS Connection Issue</h4>
                    <p className="text-sm text-red-300 mb-2">
                      Railway's infrastructure doesn't expose RTMP port 1935 for external connections. 
                      OBS will show "Failed to connect to server" when trying to stream.
                    </p>
                    <p className="text-xs text-red-300/80">
                      The RTMP server is running internally but Railway blocks external TCP connections on port 1935.
                    </p>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>

            {/* OBS Instructions (for reference) */}
            <OBSSetupInstructions obsServerUrl={obsServerUrl} />
            
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 For professional streaming, consider using the Browser Streaming method above, 
                or deploy to a platform that supports custom TCP ports.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
