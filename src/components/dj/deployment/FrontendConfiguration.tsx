
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Code, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const FrontendConfiguration = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        Streaming Server Successfully Deployed!
      </h3>
      
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
          <p className="text-sm text-green-400 font-medium mb-2">✅ Your streaming infrastructure is now live:</p>
          <div className="space-y-1 text-sm">
            <p>• <strong>RTMP Server:</strong> rtmp://nodejs-production-aa37f.up.railway.app/live</p>
            <p>• <strong>API Server:</strong> https://nodejs-production-aa37f.up.railway.app</p>
            <p>• <strong>WebSocket:</strong> wss://nodejs-production-aa37f.up.railway.app</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Your Production URLs (automatically configured):</Label>
            <div className="bg-slate-800 p-3 rounded font-mono text-sm mt-2">
              <div className="space-y-1">
                <div>VITE_STREAMING_SERVER_URL=wss://nodejs-production-aa37f.up.railway.app</div>
                <div>VITE_RTMP_URL=rtmp://nodejs-production-aa37f.up.railway.app/live</div>
                <div>VITE_HLS_BASE_URL=https://nodejs-production-aa37f.up.railway.app</div>
              </div>
            </div>
            <Button 
              onClick={() => copyToClipboard(`VITE_STREAMING_SERVER_URL=wss://nodejs-production-aa37f.up.railway.app
VITE_RTMP_URL=rtmp://nodejs-production-aa37f.up.railway.app/live
VITE_HLS_BASE_URL=https://nodejs-production-aa37f.up.railway.app`, 'Production URLs')}
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Production URLs
            </Button>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
          <h4 className="font-medium text-blue-400 mb-2">🎯 Next Steps:</h4>
          <div className="text-sm space-y-1">
            <p>1. ✅ Streaming server deployed successfully</p>
            <p>2. ✅ Frontend automatically configured for production</p>
            <p>3. 🔄 Generate a stream key to test OBS integration</p>
            <p>4. 🎬 Start streaming from OBS Studio</p>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
