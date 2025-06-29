
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { SimpleOBSSetup } from "./SimpleOBSSetup";
import { TestTube, Settings, Monitor } from "lucide-react";
import { toast } from "sonner";

export const StreamingTestPanel = () => {
  const [testMode, setTestMode] = useState<'setup' | 'test' | 'obs'>('setup');

  const runConnectionTest = async () => {
    toast.info('🔍 Testing streaming connection...');
    
    // Simple connection test
    try {
      // Test if we can access local media devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');
      
      if (hasCamera && hasMicrophone) {
        toast.success('✅ Camera and microphone detected - ready for streaming!');
      } else if (hasCamera) {
        toast.warning('⚠️ Camera detected but no microphone found');
      } else {
        toast.error('❌ No camera detected - please connect a webcam');
      }
      
      setTestMode('test');
    } catch (error) {
      console.error('Media device test failed:', error);
      toast.error('❌ Failed to access media devices');
    }
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            🎥 NightFlow Streaming Test Center
          </h2>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setTestMode('setup')}
              variant={testMode === 'setup' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Setup
            </Button>
            
            <Button
              onClick={runConnectionTest}
              variant={testMode === 'test' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Connection
            </Button>
            
            <Button
              onClick={() => setTestMode('obs')}
              variant={testMode === 'obs' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              OBS Setup
            </Button>
          </div>

          {testMode === 'setup' && (
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Welcome to NightFlow Streaming!</h3>
              <p className="text-muted-foreground">
                Let's test your streaming setup step by step before going live.
              </p>
              <Button
                onClick={runConnectionTest}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <TestTube className="mr-2 h-4 w-4" />
                Start Connection Test
              </Button>
            </div>
          )}

          {testMode === 'test' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">🔍 Connection Test Results</h3>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 font-medium">✅ Media devices detected!</p>
                <p className="text-sm text-green-300 mt-1">
                  Your camera and microphone are ready for streaming.
                </p>
              </div>
              <div className="text-center">
                <Button
                  onClick={() => setTestMode('obs')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Continue to OBS Setup
                </Button>
              </div>
            </div>
          )}

          {testMode === 'obs' && <SimpleOBSSetup />}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
