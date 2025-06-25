
import { Shield, Wifi, AlertTriangle, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { StreamingConfig } from "@/services/streaming/config";

export const NetworkCompatibilityInfo = () => {
  const portInfo = StreamingConfig.getPortInfo();
  const protocolInfo = StreamingConfig.getProtocolInfo();
  const isProduction = StreamingConfig.isProduction();

  return (
    <div className="space-y-4">
      <Alert className={isProduction ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}>
        <div className="flex items-center gap-2">
          {protocolInfo.secure ? <Lock className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-orange-600" />}
        </div>
        <AlertDescription className={isProduction ? 'text-green-800' : 'text-orange-800'}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <strong>Protocol:</strong>
              <Badge variant={protocolInfo.secure ? "default" : "secondary"} className={protocolInfo.secure ? "bg-green-500" : "bg-orange-500"}>
                {protocolInfo.protocol}
              </Badge>
              {protocolInfo.secure && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  SSL ENCRYPTED
                </Badge>
              )}
            </div>
            
            <div className="text-sm">
              <p><strong>Port:</strong> {portInfo.rtmpPort} - {portInfo.description}</p>
              <p><strong>Compatibility:</strong> {portInfo.compatibility}</p>
            </div>

            {isProduction && (
              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
                <div className="flex items-center gap-2 text-green-700">
                  <Lock className="h-4 w-4" />
                  <strong>🔒 RTMPS ENABLED - Maximum Security + Compatibility!</strong>
                </div>
                <ul className="text-xs text-green-600 mt-1 ml-6 list-disc">
                  <li><strong>SSL Encryption:</strong> Your stream data is encrypted end-to-end</li>
                  <li><strong>Port 443:</strong> Uses HTTPS port - works on ALL networks</li>
                  <li><strong>Firewall Bypass:</strong> Penetrates even the most restrictive WiFi</li>
                  <li><strong>Perfect for venues:</strong> Works at clubs, hotels, corporate networks</li>
                  <li><strong>ISP Compatible:</strong> Works with Xfinity, Comcast, Spectrum, etc.</li>
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
                  In production, this will automatically use RTMPS (secure RTMP with SSL) on port 443.
                </p>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
