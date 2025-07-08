import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, RefreshCw, Terminal } from "lucide-react";
import { URLGenerator } from "@/services/streaming/core/urlGenerator";

export const ServerConnectionAlert = () => {
  const [serverStatus, setServerStatus] = useState<{
    available: boolean;
    testedUrls: string[];
    testing: boolean;
  }>({
    available: false,
    testedUrls: [],
    testing: false
  });

  const testConnection = async () => {
    setServerStatus(prev => ({ ...prev, testing: true }));
    
    try {
      const result = await URLGenerator.testServerConnectivity();
      setServerStatus({
        available: result.available,
        testedUrls: result.testedUrls,
        testing: false
      });
    } catch (error) {
      setServerStatus({
        available: false,
        testedUrls: ["❌ Connection test failed"],
        testing: false
      });
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (serverStatus.testing) {
    return (
      <Alert>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Testing your DigitalOcean droplet server connection...
        </AlertDescription>
      </Alert>
    );
  }

  if (!serverStatus.available) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p className="font-medium">⚠️ Your DigitalOcean droplet server is not running!</p>
            <p>This is why OBS streaming isn't working. You need to start your server first.</p>
            
            <div className="p-3 bg-slate-900 rounded text-xs font-mono text-slate-300">
              <p className="text-amber-400 mb-2">📋 To start your server:</p>
              <p>1. SSH into your droplet: <span className="text-green-400">ssh root@67.205.179.77</span></p>
              <p>2. Go to server folder: <span className="text-blue-400">cd /your/server/folder</span></p>
              <p>3. Start the server: <span className="text-green-400">node streaming-server.js</span></p>
              <p className="text-amber-400 mt-2">Server should run on ports 1935 (RTMP) and 9001 (HTTP)</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Again
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-500/20 bg-green-500/10">
      <CheckCircle className="h-4 w-4 text-green-400" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium text-green-400">✅ Your DigitalOcean droplet server is online!</p>
          <p className="text-sm text-green-300">Ready for OBS streaming on HTTP port 9001</p>
          
          <Button onClick={testConnection} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};