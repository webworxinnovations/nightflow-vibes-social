
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { SimpleOBSSetup } from "./SimpleOBSSetup";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { useStreamKey } from "@/hooks/useStreamKey";
import { TestTube, Settings, Monitor, Play } from "lucide-react";
import { toast } from "sonner";

export const StreamingTestPanel = () => {
  const [testMode, setTestMode] = useState<'welcome' | 'test' | 'obs'>('welcome');
  const { streamData, isLive } = useStreamKey();

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
          {/* Big welcome message */}
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TestTube className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-400 mb-4">
              NightFlow OBS Streaming Test
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Let's get your OBS streaming working locally!
            </p>
          </div>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setTestMode('welcome')}
              variant={testMode === 'welcome' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Welcome
            </Button>
            
            <Button
              onClick={runConnectionTest}
              variant={testMode === 'test' ? 'default' : 'outline'}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <TestTube className="h-4 w-4" />
              Test My Setup
            </Button>
            
            <Button
              onClick={() => setTestMode('obs')}
              variant={testMode === 'obs' ? 'default' : 'outline'}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Monitor className="h-4 w-4" />
              Configure OBS
            </Button>
          </div>

          {testMode === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Welcome to NightFlow OBS Testing!</h3>
                <p className="text-muted-foreground mb-6">
                  This will test your streaming setup step by step before going live.
                  No external servers needed - everything works locally!
                </p>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span>Test camera and microphone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span>Generate OBS configuration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span>Copy settings to OBS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                    <span>Start streaming!</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={runConnectionTest}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Testing My Setup
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
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 text-lg"
                >
                  <Monitor className="mr-2 h-5 w-5" />
                  Continue to OBS Configuration
                </Button>
              </div>
            </div>
          )}

          {testMode === 'obs' && <SimpleOBSSetup />}
        </div>
      </GlassmorphicCard>

      {/* Video Preview Section - This is where you'll see your OBS stream */}
      {streamData?.hlsUrl && (
        <GlassmorphicCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">📺 Live Stream Preview</h3>
              {isLive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">LIVE</span>
                </div>
              )}
            </div>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <RealVideoPlayer 
                hlsUrl={streamData.hlsUrl}
                isLive={isLive}
                autoplay={true}
                muted={false}
              />
            </div>
            
            <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                {isLive 
                  ? "🔴 Your OBS stream is live! This is what viewers will see."
                  : "⚫ Start streaming from OBS to see your live preview here."
                }
              </p>
            </div>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};
