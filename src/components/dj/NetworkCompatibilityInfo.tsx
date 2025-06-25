
import { Shield, Wifi, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { StreamingConfig } from "@/services/streaming/config";

export const NetworkCompatibilityInfo = () => {
  const portInfo = StreamingConfig.getPortInfo();
  const protocolInfo = StreamingConfig.getProtocolInfo();
  const isProduction = StreamingConfig.isProduction();

  return (
    <div className="space-y-4">
      <Alert className="border-green-500 bg-green-50">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
        </div>
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <strong>Protocol:</strong>
              <Badge variant="default" className="bg-green-500">
                {protocolInfo.protocol}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                OBS COMPATIBLE
              </Badge>
            </div>
            
            <div className="text-sm">
              <p><strong>Port:</strong> {portInfo.rtmpPort} - {portInfo.description}</p>
              <p><strong>Compatibility:</strong> {portInfo.compatibility}</p>
            </div>

            <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <strong>✅ Standard RTMP - Maximum OBS Compatibility!</strong>
              </div>
              <ul className="text-xs text-green-600 mt-1 ml-6 list-disc">
                <li><strong>Port 1935:</strong> The standard RTMP port that all OBS versions support</li>
                <li><strong>No SSL complexity:</strong> Simple, reliable connection</li>
                <li><strong>Tested & Proven:</strong> Used by Twitch, YouTube, and all major platforms</li>
                <li><strong>Maximum compatibility:</strong> Works with OBS Studio, XSplit, and all streaming software</li>
                <li><strong>No firewall issues:</strong> Railway handles port routing automatically</li>
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
