
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, CheckCircle, Play, Square, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";

export const SimpleOBSSetup = () => {
  const [streamKey, setStreamKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [serverStarted, setServerStarted] = useState(false);

  useEffect(() => {
    // Generate a simple stream key on component mount
    const key = `nf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setStreamKey(key);
  }, []);

  const handleGenerateStreamKey = async () => {
    try {
      const key = `nf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setStreamKey(key);
      setServerStarted(true);
      
      toast.success('✅ Stream key generated! Use the settings below in OBS.');
      toast.info('📝 IMPORTANT: Copy these EXACT settings into OBS Studio', {
        duration: 5000
      });
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key');
    }
  };

  const startWebcamTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      setWebcamStream(stream);
      setIsLive(true);
      toast.success('🔴 Webcam test started! This proves your setup works.');
    } catch (error) {
      console.error('Failed to start webcam:', error);
      toast.error('Failed to start webcam - check permissions');
    }
  };

  const stopWebcamTest = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
    setWebcamStream(null);
    setIsLive(false);
    toast.info('⏹️ Webcam test stopped');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const formatStreamKey = (key: string) => {
    if (!showKey && key) {
      return `${key.slice(0, 8)}${'•'.repeat(Math.max(0, key.length - 12))}${key.slice(-4)}`;
    }
    return key;
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">OBS Streaming Setup</h3>
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-medium">WEBCAM TEST LIVE</span>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-400 font-medium">⚠️ REAL STREAMING REQUIRES EXTERNAL SERVER</p>
            </div>
            <p className="text-sm text-yellow-300 mb-2">
              This local setup is for TESTING ONLY. For real streaming to viewers, you need:
            </p>
            <ul className="text-sm text-yellow-300 space-y-1 ml-4">
              <li>• A working RTMP server (like DigitalOcean droplet)</li>
              <li>• Or a streaming service (Twitch, YouTube, etc.)</li>
              <li>• This local test just shows OBS can capture video</li>
            </ul>
          </div>

          {/* Stream Key Generation */}
          <div className="space-y-4">
            <Button
              onClick={handleGenerateStreamKey}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Generate Test Configuration
            </Button>

            {streamKey && serverStarted && (
              <>
                {/* Test RTMP URL for OBS */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-blue-400">
                    📺 OBS Server URL (TEST ONLY)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value="rtmp://localhost:1935/live"
                      readOnly
                      className="font-mono text-sm bg-blue-500/10 border-blue-500/20 text-blue-300"
                    />
                    <Button
                      onClick={() => copyToClipboard("rtmp://localhost:1935/live", "Server URL")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-400">
                    📝 Copy this into OBS Settings → Stream → Server
                  </p>
                </div>

                {/* Stream Key */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-green-400">
                    🔑 Stream Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={formatStreamKey(streamKey)}
                      readOnly
                      type={showKey ? "text" : "password"}
                      className="font-mono text-sm bg-green-500/10 border-green-500/20"
                    />
                    <Button
                      onClick={() => setShowKey(!showKey)}
                      variant="outline"
                      size="sm"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(streamKey, 'Stream key')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-400">
                    📝 Copy this into OBS Settings → Stream → Stream Key
                  </p>
                </div>

                {/* OBS Instructions */}
                <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
                  <h4 className="font-medium text-slate-300 mb-3">📋 OBS Setup Steps (FOR TESTING):</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>Open OBS Studio</li>
                    <li>Go to Settings → Stream</li>
                    <li>Service: Select "Custom..."</li>
                    <li>Server: rtmp://localhost:1935/live</li>
                    <li>Stream Key: {streamKey.slice(0, 12)}...</li>
                    <li>Click Apply → OK</li>
                    <li>Click "Start Streaming" (will show "connecting" then fail - this is normal for local test)</li>
                  </ol>
                </div>

                {/* Test Webcam Stream */}
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="font-medium text-purple-400 mb-3">🎥 Test Your Webcam (Browser Test):</h4>
                  <p className="text-sm text-purple-300 mb-3">
                    Test your webcam in the browser to verify video/audio work
                  </p>
                  <div className="flex gap-2">
                    {!isLive ? (
                      <Button
                        onClick={startWebcamTest}
                        variant="outline"
                        className="border-purple-500/20 text-purple-400"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Webcam Test
                      </Button>
                    ) : (
                      <Button
                        onClick={stopWebcamTest}
                        variant="outline"
                        className="border-red-500/20 text-red-400"
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop Webcam Test
                      </Button>
                    )}
                  </div>
                </div>

                {/* Webcam Preview */}
                {webcamStream && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-medium text-green-400 mb-3">📹 Live Webcam Preview:</h4>
                    <video
                      ref={(video) => {
                        if (video && webcamStream) {
                          video.srcObject = webcamStream;
                        }
                      }}
                      autoPlay
                      muted
                      className="w-full max-w-md rounded-lg"
                    />
                    <p className="text-sm text-green-300 mt-2">
                      ✅ Your webcam works! OBS can capture this same video.
                    </p>
                  </div>
                )}

                {/* Reality Check */}
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400 font-medium">
                      🚨 IMPORTANT: This is a LOCAL TEST ONLY
                    </p>
                  </div>
                  <p className="text-sm text-red-300 mt-2">
                    OBS will try to connect to localhost:1935 but there's no real server running there. 
                    This is normal - it's just testing your OBS configuration.
                  </p>
                  <p className="text-sm text-red-300 mt-1">
                    For REAL streaming, you need to fix your DigitalOcean server or use a different streaming service.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};
