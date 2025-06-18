
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Code, Copy } from "lucide-react";
import { toast } from "sonner";

export const FrontendConfiguration = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Code className="h-5 w-5" />
        Frontend Configuration
      </h3>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          After deploying your streaming server, update these URLs in your environment:
        </p>
        
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Environment Variables to Set:</Label>
            <div className="bg-slate-800 p-3 rounded font-mono text-sm mt-2">
              <div className="space-y-1">
                <div>VITE_STREAMING_SERVER_URL=wss://your-streaming-server.railway.app</div>
                <div>VITE_RTMP_URL=rtmp://your-streaming-server.railway.app/live</div>
                <div>VITE_HLS_BASE_URL=https://your-streaming-server.railway.app</div>
              </div>
            </div>
            <Button 
              onClick={() => copyToClipboard(`VITE_STREAMING_SERVER_URL=wss://your-streaming-server.railway.app
VITE_RTMP_URL=rtmp://your-streaming-server.railway.app/live
VITE_HLS_BASE_URL=https://your-streaming-server.railway.app`, 'Environment configuration')}
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Configuration
            </Button>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
