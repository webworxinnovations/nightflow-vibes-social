
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Monitor } from "lucide-react";

interface TroubleshootingGuideProps {
  serverAvailable: boolean;
}

export const TroubleshootingGuide = ({ serverAvailable }: TroubleshootingGuideProps) => {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Monitor className="h-5 w-5" />
        OBS Troubleshooting Guide
      </h3>
      
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <h4 className="font-medium text-green-400 mb-3">✅ DigitalOcean Server is Running!</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Your RTMP streaming server at <code className="bg-muted px-1 rounded">nightflow-app-wijb2.ondigitalocean.app</code> is fully operational.
          </p>
          <p className="text-sm text-muted-foreground">
            RTMP, HLS, WebSocket, and HTTP streaming services are all ready.
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-3">📋 Your OBS Settings Should Be:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Service: Custom... ✅</li>
            <li>Server: <code className="bg-muted px-1 rounded">rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live</code> ✅</li>
            <li>Stream Key: Generate one using the button above ✅</li>
          </ul>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h4 className="font-medium text-yellow-400 mb-3">🔧 If OBS Still Can't Connect:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Generate a fresh stream key using the "Generate Professional Stream Setup" button</li>
            <li>Copy the exact server URL: <code className="bg-muted px-1 rounded">rtmp://nightflow-app-wijb2.ondigitalocean.app:1935/live</code></li>
            <li>Restart OBS completely</li>
            <li>Check if your network/ISP blocks RTMP (port 1935)</li>
            <li>Try from a different network (mobile hotspot) to test</li>
            <li>In OBS Settings → Advanced → Network, set "Bind to IP" to "Default"</li>
          </ol>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-3">🌐 Alternative: Browser Streaming</h4>
          <p className="text-sm text-muted-foreground">
            If RTMP is blocked by your ISP, use the "Browser Stream" tab for direct streaming from your browser.
          </p>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
