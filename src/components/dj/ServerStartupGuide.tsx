
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Terminal, Server, Play, Copy, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";

export const ServerStartupGuide = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">DigitalOcean Droplet Setup</h3>
        </div>

        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            <strong>Server Files Missing:</strong> Your droplet needs the streaming server code uploaded first.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 1: Connect to Your Droplet</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm flex items-center justify-between">
              <span>ssh root@67.205.179.77</span>
              <Button 
                onClick={() => copyToClipboard('ssh root@67.205.179.77', 'SSH command')}
                variant="ghost" size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 2: Install Node.js & Dependencies</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -</span>
                <Button 
                  onClick={() => copyToClipboard('curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -', 'Node.js install')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>apt install -y nodejs ffmpeg</span>
                <Button 
                  onClick={() => copyToClipboard('apt install -y nodejs ffmpeg', 'Install packages')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>npm install -g pm2</span>
                <Button 
                  onClick={() => copyToClipboard('npm install -g pm2', 'Install PM2')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 3: Create Streaming Server</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>mkdir -p /root/streaming-server</span>
                <Button 
                  onClick={() => copyToClipboard('mkdir -p /root/streaming-server', 'Create directory')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>cd /root/streaming-server</span>
                <Button 
                  onClick={() => copyToClipboard('cd /root/streaming-server', 'Change directory')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 4: Create Server Files</h4>
            <div className="bg-black/30 p-3 rounded text-sm space-y-3">
              <div>
                <div className="text-yellow-400 mb-1">Create package.json:</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">cat > package.json</span>
                  <Button 
                    onClick={() => copyToClipboard(`cat > package.json << 'EOF'
{
  "name": "nightflow-streaming-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-media-server": "^2.6.3",
    "ws": "^8.13.0"
  }
}
EOF`, 'Package.json')}
                    variant="ghost" size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-yellow-400 mb-1">Create server.js:</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">cat > server.js</span>
                  <Button 
                    onClick={() => copyToClipboard(`cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const NodeMediaServer = require('node-media-server');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stream status endpoint
app.get('/api/stream/:streamKey/status', (req, res) => {
  res.json({
    isLive: false,
    viewerCount: 0,
    duration: 0,
    bitrate: 0,
    resolution: '',
    timestamp: new Date().toISOString()
  });
});

// Server stats endpoint
app.get('/api/server/stats', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    version: '2.0.4'
  });
});

// RTMP Server configuration
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8888,
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);

// Start servers
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ API Server running on port \${PORT}\`);
});

nms.run();
console.log('✅ RTMP Server running on port 1935');
console.log('✅ HLS Server running on port 8888');

// WebSocket server
const wss = new WebSocket.Server({ server });
console.log('✅ WebSocket server running');

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  nms.stop();
  server.close();
  process.exit(0);
});
EOF`, 'Server.js')}
                    variant="ghost" size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 5: Install & Start Server</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>npm install</span>
                <Button 
                  onClick={() => copyToClipboard('npm install', 'Install dependencies')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>pm2 start server.js --name nightflow-streaming</span>
                <Button 
                  onClick={() => copyToClipboard('pm2 start server.js --name nightflow-streaming', 'Start server')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>pm2 save && pm2 startup</span>
                <Button 
                  onClick={() => copyToClipboard('pm2 save && pm2 startup', 'Save PM2 config')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-blue-400 mb-2">Step 6: Configure Firewall</h4>
            <div className="bg-black/30 p-3 rounded font-mono text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span>ufw allow 1935 && ufw allow 3001 && ufw allow 8888</span>
                <Button 
                  onClick={() => copyToClipboard('ufw allow 1935 && ufw allow 3001 && ufw allow 8888', 'Open ports')}
                  variant="ghost" size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-400">Opens RTMP (1935), API (3001), and HLS (8888) ports</div>
            </div>
          </div>

          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-4 w-4 text-green-400" />
              <span className="font-medium text-green-400">Once Server is Running:</span>
            </div>
            <div className="text-sm space-y-1">
              <div>✅ Test: curl http://67.205.179.77:3001/health</div>
              <div>✅ Generate stream key in this app</div>
              <div>✅ Configure OBS: rtmp://67.205.179.77:1935/live</div>
              <div>✅ Start streaming and video will appear here</div>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
