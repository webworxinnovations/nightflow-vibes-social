
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Terminal } from "lucide-react";

export const TestingGuide = () => {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Terminal className="h-5 w-5" />
        Testing Your Deployment
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
            <h4 className="font-medium text-green-400 mb-2">✅ Verification Steps:</h4>
            <ul className="text-sm space-y-1">
              <li>• API endpoint responds at /health</li>
              <li>• WebSocket connects successfully</li>
              <li>• Stream key generation works</li>
              <li>• OBS connects to RTMP server</li>
              <li>• Video streams to viewers</li>
            </ul>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
            <h4 className="font-medium text-blue-400 mb-2">🛠️ Troubleshooting:</h4>
            <ul className="text-sm space-y-1">
              <li>• Check server logs for errors</li>
              <li>• Verify all ports are open</li>
              <li>• Test RTMP with OBS</li>
              <li>• Confirm HTTPS/WSS in production</li>
              <li>• Monitor resource usage</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
          <h4 className="font-medium text-purple-400 mb-2">🚀 Go Live Checklist:</h4>
          <div className="text-sm space-y-1">
            <p>1. Streaming server deployed and running</p>
            <p>2. Frontend environment variables updated</p>
            <p>3. DJs can generate stream keys</p>
            <p>4. OBS connects successfully</p>
            <p>5. Viewers can watch streams</p>
            <p>6. Real-time status updates working</p>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
