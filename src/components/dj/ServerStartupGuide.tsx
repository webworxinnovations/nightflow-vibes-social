
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Terminal, Server, Play, Copy } from "lucide-react";
import { toast } from "sonner";

export const ServerStartupGuide = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">DigitalOcean Droplet Setup</h3>
        </div>

        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Terminal className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">
            <strong>Action Required:</strong> Your DigitalOcean droplet at 67.205.179.77 needs to be running the streaming server.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 1: Connect to Your Droplet</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm flex items-center justify-between">
              <span>ssh root@67.205.179.77</span>
              <Button 
                onClick={() => copyToClipboard('ssh root@67.205.179.77', 'SSH command')}
                variant="ghost" size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 2: Check Server Status</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>pm2 status</span>
                <Button 
                  onClick={() => copyToClipboard('pm2 status', 'PM2 status command')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-400">Check if streaming server is running</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 3: Start Streaming Server</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>cd /root/streaming-server && npm start</span>
                <Button 
                  onClick={() => copyToClipboard('cd /root/streaming-server && npm start', 'Start server command')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-400">Start the Node.js streaming server</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 4: Verify Ports Are Open</h4>
            <div className="bg-black/30 p-3 rounded text-sm space-y-1">
              <div>• Port 1935: RTMP (for OBS connections)</div>
              <div>• Port 3001: API (for app communication)</div>
              <div>• Port 8888: HLS (for video streaming)</div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-4 w-4 text-green-400" />
              <span className="font-medium text-green-400">Once Server is Running:</span>
            </div>
            <div className="text-sm space-y-1">
              <div>✅ Generate stream key in the app</div>
              <div>✅ Configure OBS: rtmp://67.205.179.77:1935/live</div>
              <div>✅ Start streaming in OBS</div>
              <div>✅ Video will appear in your Nightflow app</div>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
