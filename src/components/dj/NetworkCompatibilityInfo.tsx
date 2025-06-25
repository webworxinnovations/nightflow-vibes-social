
import { Shield, Wifi, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { StreamingConfig } from "@/services/streaming/config";

export const NetworkCompatibilityInfo = () => {
  const portInfo = StreamingConfig.getPortInfo();
  const isProduction = StreamingConfig.isProduction();

  return (
    <div className="space-y-4">
      <Alert className={isProduction ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}>
        <Shield className={`h-4 w-4 ${isProduction ? 'text-green-600' : 'text-orange-600'}`} />
        <AlertDescription className={isProduction ? 'text-green-800' : 'text-orange-800'}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <strong>Network Compatibility:</strong>
              <Badge variant={isProduction ? "default" : "secondary"} className={isProduction ? "bg-green-500" : "bg-orange-500"}>
                {isProduction ? "MAXIMUM" : "LIMITED"}
              </Badge>
            </div>
            
            <div className="text-sm">
              <p><strong>RTMP Port:</strong> {portInfo.rtmpPort} - {portInfo.description}</p>
              <p><strong>Compatibility:</strong> {portInfo.compatibility}</p>
            </div>

            {isProduction && (
              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
                <div className="flex items-center gap-2 text-green-700">
                  <Wifi className="h-4 w-4" />
                  <strong>✅ Perfect for DJs at venues!</strong>
                </div>
                <ul className="text-xs text-green-600 mt-1 ml-6 list-disc">
                  <li>Works on Xfinity, Comcast, and other home networks</li>
                  <li>Compatible with club and venue WiFi systems</li>
                  <li>Bypasses most corporate and public WiFi restrictions</li>
                  <li>Uses port 443 (same as HTTPS) - rarely blocked</li>
                </ul>
              </div>
            )}

            {!isProduction && (
              <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  <strong>⚠️ Development Mode</strong>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  In production, this will automatically use port 443 for maximum network compatibility.
                </p>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
