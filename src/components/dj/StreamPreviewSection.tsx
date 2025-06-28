import { useStreamKey } from "@/hooks/useStreamKey";
import { useStreamDuration } from "@/hooks/useStreamDuration";
import { RealVideoPlayer } from "./RealVideoPlayer";
import { StreamStatsGrid } from "./StreamStatsGrid";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Key, RefreshCw, Trash2, AlertTriangle, Settings } from "lucide-react";
import { toast } from "sonner";

export const StreamPreviewSection = () => {
  const { streamData, isLive, viewerCount, generateStreamKey } = useStreamKey();
  const { streamDuration, formatDuration } = useStreamDuration(isLive);

  const debugInfo = useMemo(() => {
    if (streamData?.streamKey) {
      return {
        streamUrl: streamData.hlsUrl,
        streamKey: streamData.streamKey,
        rtmpUrl: streamData.rtmpUrl,
        status: isLive ? 'Live' : 'Ready for OBS'
      };
    }
    return null;
  }, [streamData?.streamKey, streamData?.hlsUrl, streamData?.rtmpUrl, isLive]);

  // Check for mixed content issues
  const hasMixedContentIssue = useMemo(() => {
    return window.location.protocol === 'https:' && 
           debugInfo?.streamUrl && 
           debugInfo.streamUrl.startsWith('http://');
  }, [debugInfo?.streamUrl]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const handleGenerateNewKey = async () => {
    try {
      toast.info('🔑 Generating new stream key for DigitalOcean droplet...');
      await generateStreamKey();
      toast.success('✅ New stream key generated! Copy settings to OBS and start streaming.');
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key. Check if your DigitalOcean droplet is running.');
    }
  };

  const handleClearAndRegenerate = async () => {
    try {
      toast.info('🔄 Resetting stream configuration for DigitalOcean droplet...');
      localStorage.removeItem('nightflow_stream_config');
      await handleGenerateNewKey();
    } catch (error) {
      console.error('Failed to clear and regenerate:', error);
      toast.error('Failed to reset stream configuration');
    }
  };

  const handleFixDropletPorts = () => {
    toast.info(
      '🔧 DROPLET FIREWALL FIX NEEDED:\n\n' +
      '1. SSH to droplet: ssh root@67.205.179.77\n' +
      '2. Allow required ports:\n' +
      '   ufw allow 3001\n' +
      '   ufw allow 1935\n' +
      '3. Check firewall: ufw status\n' +
      '4. Restart server: pm2 restart nightflow-streaming\n\n' +
      'Your server is running but ports need to be opened!',
      { duration: 15000 }
    );
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        {/* Stream Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" />
              DigitalOcean Droplet Stream Configuration
            </h3>
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-medium">LIVE</span>
                <span className="text-muted-foreground">
                  {viewerCount} viewers • {formatDuration(streamDuration)}
                </span>
              </div>
            )}
          </div>

          {/* MIXED CONTENT ALERT */}
          {hasMixedContentIssue && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="text-red-400 font-medium">🔒 MIXED CONTENT ISSUE DETECTED</p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your HTTPS page cannot load HTTP content from your droplet. This is a browser security restriction.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Solutions:</strong></p>
                <p>• Access your app via HTTP: <code className="bg-slate-700 px-1 rounded">http://lovable.dev/your-project</code></p>
                <p>• Or enable HTTPS on your DigitalOcean droplet server</p>
              </div>
            </div>
          )}

          {/* CRITICAL FIREWALL ALERT */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-400 font-medium">🔥 DROPLET FIREWALL ISSUE DETECTED</p>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Your DigitalOcean droplet server is running (confirmed by pm2), but ports 3001 and 1935 are not accessible from the internet. This is a firewall configuration issue.
            </p>
            <Button
              onClick={handleFixDropletPorts}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Show Firewall Fix Commands
            </Button>
          </div>

          {debugInfo ? (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-green-400 font-medium">
                    ✅ Stream configuration ready for DigitalOcean droplet (IP: 67.205.179.77)
                  </p>
                </div>
              </div>

              {/* OBS Server URL */}
              <div className="space-y-2">
                <Label className="text-blue-400">OBS Server URL (for DigitalOcean Droplet)</Label>
                <div className="flex gap-2">
                  <Input
                    value={debugInfo.rtmpUrl}
                    readOnly
                    className="font-mono text-sm bg-blue-500/10 border-blue-500/20"
                  />
                  <Button
                    onClick={() => copyToClipboard(debugInfo.rtmpUrl, 'Server URL')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-2">
                <Label className="text-green-400">Stream Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={debugInfo.streamKey}
                    readOnly
                    type="password"
                    className="font-mono text-sm bg-green-500/10 border-green-500/20"
                  />
                  <Button
                    onClick={() => copyToClipboard(debugInfo.streamKey, 'Stream key')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateNewKey}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Stream Key
                </Button>
                <Button
                  onClick={handleClearAndRegenerate}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear & Reset
                </Button>
              </div>

              {/* Droplet Connection Info */}
              <div className="text-xs text-muted-foreground bg-slate-800/50 p-3 rounded">
                <p className="font-medium text-blue-400 mb-2">DigitalOcean Droplet Configuration:</p>
                <p>🌊 Droplet IP: 67.205.179.77</p>
                <p>📡 RTMP Port: 1935 (for OBS connection)</p>
                <p>🎥 HLS Port: 3001 (for web playback)</p>
                <p>🔗 HLS URL: {debugInfo.streamUrl}</p>
                <p>📊 Status: {debugInfo.status}</p>
                {hasMixedContentIssue && (
                  <p className="text-red-400 mt-2">🔒 Mixed content issue detected!</p>
                )}
                <p className="text-red-400 mt-2">⚠️ Firewall ports need to be opened!</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <p className="text-amber-400 font-medium">No stream configuration found</p>
                </div>
                <p className="text-amber-400 text-sm">
                  Generate a stream key to connect OBS to your DigitalOcean droplet server.
                </p>
              </div>
              <Button onClick={handleClearAndRegenerate} className="bg-blue-600 hover:bg-blue-700">
                <Key className="mr-2 h-4 w-4" />
                Generate Fresh Stream Key for Droplet
              </Button>
            </div>
          )}
        </div>

        {/* Droplet Status Alert */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <p className="text-blue-400 font-medium">DigitalOcean Droplet Server Status</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Server confirmed running via pm2, but firewall configuration needed.
          </p>
          <p className="text-sm text-muted-foreground">
            SSH command: <code className="bg-slate-700 px-1 rounded">ssh root@67.205.179.77</code>
          </p>
          {hasMixedContentIssue && (
            <p className="text-sm text-red-400 mt-2">
              🔒 Also resolve mixed content issue by using HTTP or enabling HTTPS on droplet.
            </p>
          )}
        </div>

        {/* Video Player */}
        <RealVideoPlayer 
          hlsUrl={debugInfo?.streamUrl || ''}
          isLive={isLive}
        />

        {/* Stream Stats */}
        <StreamStatsGrid
          isLive={isLive}
          viewerCount={viewerCount}
          streamDuration={streamDuration}
          formatDuration={formatDuration}
        />
      </div>
    </GlassmorphicCard>
  );
};
