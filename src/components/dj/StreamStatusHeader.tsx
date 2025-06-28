
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Timer, Activity, Eye, RefreshCw, TestTube } from "lucide-react";

interface StreamStatusHeaderProps {
  isLive: boolean;
  viewerCount: number;
  streamDuration: number;
  streamUrl?: string;
  onRefresh: () => void;
  onTestServer: () => void;
  onShowDiagnostics: () => void;
  testingServer: boolean;
  formatDuration: (seconds: number) => string;
}

export const StreamStatusHeader = ({
  isLive,
  viewerCount,
  streamDuration,
  streamUrl,
  onRefresh,
  onTestServer,
  onShowDiagnostics,
  testingServer,
  formatDuration
}: StreamStatusHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Eye className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Your Live Stream</h3>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>

        <Button
          onClick={onTestServer}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={testingServer}
        >
          <TestTube className="h-4 w-4" />
          {testingServer ? 'Testing...' : 'Test Server'}
        </Button>

        <Button
          onClick={onShowDiagnostics}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          🔍 Diagnostics
        </Button>
        
        {isLive ? (
          <Badge variant="destructive" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </Badge>
        ) : (
          <Badge variant="secondary">CONNECTING...</Badge>
        )}
        
        {streamUrl && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {viewerCount}
            </div>
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4" />
              {formatDuration(streamDuration)}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Broadcasting
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
