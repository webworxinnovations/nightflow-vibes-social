
import { AlertCircle } from "lucide-react";

interface StreamTroubleshootingAlertsProps {
  serverTest: { available: boolean; details: string[] } | null;
}

export const StreamTroubleshootingAlerts = ({ serverTest }: StreamTroubleshootingAlertsProps) => {
  if (!serverTest) return null;

  return (
    <>
      {/* Server Status Alert */}
      {!serverTest.available && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-400">Critical: Streaming Server Offline</span>
          </div>
          <div className="text-sm text-red-300 space-y-2">
            <p>Your DigitalOcean streaming server is not responding. This means:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>OBS cannot connect to stream</li>
              <li>No video will be available for viewers</li>
              <li>Stream preview will not work</li>
            </ul>
            <p className="font-medium mt-3">To fix this issue:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check if your DigitalOcean droplet is running</li>
              <li>SSH into the droplet and restart streaming services</li>
              <li>Verify firewall allows ports 1935, 8080, 8888</li>
              <li>Check droplet resource usage (CPU/Memory)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Normal troubleshooting for when server is online */}
      {serverTest.available && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-yellow-400">Stream Troubleshooting</span>
          </div>
          <div className="text-sm text-yellow-300 space-y-1">
            <p>Server is online! If your stream isn't appearing:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Wait 30-60 seconds after clicking "Start Streaming" in OBS</li>
              <li>Make sure OBS is using: <code className="bg-black/20 px-1 rounded">rtmp://67.205.179.77:1935/live</code></li>
              <li>Check that your stream key matches the one shown in diagnostics</li>
              <li>Try clicking the "Refresh" button above</li>
              <li>If still not working, stop and restart OBS streaming</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
