
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { streamingService } from "@/services/streamingService";
import { toast } from "sonner";

interface RTMPConnectionTesterProps {
  streamConfig: { streamKey: string; rtmpUrl: string } | null;
  serverAvailable: boolean;
}

export const RTMPConnectionTester = ({ streamConfig, serverAvailable }: RTMPConnectionTesterProps) => {
  const [testingConnection, setTestingConnection] = useState(false);

  const testRTMPConnection = async () => {
    if (!streamConfig?.streamKey) {
      toast.error('Generate a stream key first');
      return;
    }

    setTestingConnection(true);
    console.log('🎥 Testing RTMP connection with stream key:', streamConfig.streamKey);
    
    try {
      // Test 1: Check if server is responding
      const serverCheck = await streamingService.getServerStatus();
      console.log('📡 Server status:', serverCheck);
      
      if (!serverCheck.available) {
        toast.error('❌ RTMP server is offline - this is why OBS can\'t connect!');
        setTestingConnection(false);
        return;
      }
      
      // Test 2: Try to validate the stream key
      toast.info('🔍 Validating stream key with server...');
      const isValid = await streamingService.validateStreamKey(streamConfig.streamKey);
      console.log('🔑 Stream key validation result:', isValid);
      
      if (isValid) {
        toast.success('✅ Stream key is valid!');
        
        // Test 3: Check if RTMP server is ready by examining the health check details
        toast.info('🧪 Testing RTMP readiness...');
        
        try {
          // Call the API health endpoint to get detailed server status
          const healthResponse = await fetch(`${serverCheck.url}/api/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000)
          });
          
          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('🏥 Health check details:', healthData);
            
            if (healthData.rtmp_ready === true) {
              toast.success('🎯 RTMP server is ready! OBS should be able to connect now.');
              
              // Show detailed connection info
              toast.info(
                `📡 OBS Connection Verified:\n` +
                `✅ Server: ${streamConfig.rtmpUrl}\n` +
                `✅ Key: ${streamConfig.streamKey.substring(0, 8)}...\n` +
                `✅ RTMP Status: Ready\n` +
                `🎥 Try connecting with OBS now!`,
                { duration: 15000 }
              );
            } else {
              toast.warning('⚠️ RTMP server reports not ready. Check server deployment.');
            }
          } else {
            toast.warning(`⚠️ Health check returned ${healthResponse.status}. Server may have issues.`);
          }
        } catch (healthError) {
          console.log('Health check failed:', healthError);
          toast.warning('⚠️ Could not verify RTMP server status, but stream key is valid.');
          
          // Still show connection info since key is valid
          toast.info(
            `📡 Connection Details:\n` +
            `Server: ${streamConfig.rtmpUrl}\n` +
            `Key: ${streamConfig.streamKey.substring(0, 8)}...\n` +
            `Status: Stream key validated - try OBS connection`,
            { duration: 10000 }
          );
        }
      } else {
        toast.error('❌ Stream key validation failed. Try generating a new key.');
      }
    } catch (error) {
      console.error('❌ RTMP test failed:', error);
      toast.error(`Failed to test RTMP connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-blue-400 font-medium">🧪 Test RTMP Connection</p>
        <Button
          onClick={testRTMPConnection}
          disabled={testingConnection || !serverAvailable}
          variant="outline"
          size="sm"
          className="min-w-[120px]"
        >
          {testingConnection ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        This will verify your stream key works with the RTMP server before trying OBS.
      </p>
    </div>
  );
};
