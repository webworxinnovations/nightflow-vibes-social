
import { Smartphone } from "lucide-react";

export const NetworkCompatibilityCard = () => {
  return (
    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
      <div className="flex items-start gap-3">
        <Smartphone className="h-5 w-5 text-green-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-400 mb-2">✅ Works with ANY Internet Connection!</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• No RTMP/port 1935 restrictions</li>
            <li>• No firewall issues</li>
            <li>• No ISP blocking</li>
            <li>• Works on mobile data, WiFi, any network</li>
            <li>• High quality HD streaming</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
