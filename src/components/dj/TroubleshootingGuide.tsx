
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
        {!serverAvailable && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="font-medium text-red-400 mb-3">🚨 Connection Issue Found:</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The RTMP streaming server at <code className="bg-muted px-1 rounded">nightflow-vibes-social-production.up.railway.app</code> is not responding.
            </p>
            <p className="text-sm text-muted-foreground">
              This explains why OBS shows "Failed to connect to server" - the issue is on the server side, not with your OBS configuration.
            </p>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-3">📋 Your OBS Settings Look Correct:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Service: Custom... ✅</li>
            <li>Server: rtmp://nightflow-vibes-social-production.up.railway.app/live ✅</li>
            <li>Stream Key: Present ✅</li>
          </ul>
        </div>

        {serverAvailable && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-400 mb-3">🎯 Server is Online - Try These Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Test Connection" above to verify your stream key</li>
              <li>If test passes, restart OBS completely</li>
              <li>In OBS, try changing Settings → Advanced → Network → Bind to IP to "Default"</li>
              <li>Try generating a new stream key and copying it fresh into OBS</li>
              <li>Check if your firewall or network is blocking RTMP (port 1935)</li>
            </ol>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};
