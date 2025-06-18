
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Server, 
  Code, 
  CheckCircle, 
  ExternalLink,
  Copy,
  Download,
  Terminal
} from "lucide-react";
import { toast } from "sonner";

export const DeploymentGuide = () => {
  const [activeStep, setActiveStep] = useState(0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const deploymentSteps = [
    {
      title: "Prepare Server Code",
      description: "Ensure your streaming server is ready for deployment",
      completed: true
    },
    {
      title: "Choose Platform", 
      description: "Select Railway, DigitalOcean, or Heroku for deployment",
      completed: false
    },
    {
      title: "Deploy Infrastructure",
      description: "Upload and configure the streaming server",
      completed: false
    },
    {
      title: "Update Environment",
      description: "Configure production URLs in your frontend",
      completed: false
    },
    {
      title: "Test & Go Live",
      description: "Verify OBS integration and start streaming",
      completed: false
    }
  ];

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            Streaming Infrastructure Deployment
          </h2>
          <div className="text-sm text-muted-foreground">
            Required for OBS integration
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {deploymentSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : index === activeStep 
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < deploymentSteps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-medium">{deploymentSteps[activeStep]?.title}</h3>
            <p className="text-sm text-muted-foreground">{deploymentSteps[activeStep]?.description}</p>
          </div>
        </div>

        <Tabs defaultValue="railway" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="railway">Railway (Recommended)</TabsTrigger>
            <TabsTrigger value="digitalocean">DigitalOcean</TabsTrigger>
            <TabsTrigger value="heroku">Heroku</TabsTrigger>
          </TabsList>
          
          <TabsContent value="railway" className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                <Server className="h-4 w-4" />
                Railway Deployment (Easiest)
              </h4>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">1. Deploy to Railway:</p>
                  <div className="bg-slate-800 p-3 rounded font-mono text-sm mb-2">
                    # Push your server/ folder to GitHub<br/>
                    # Then visit railway.app and deploy from GitHub
                  </div>
                  <Button 
                    onClick={() => window.open('https://railway.app', '_blank')}
                    variant="outline" 
                    size="sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Railway
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">2. Set Environment Variables:</p>
                  <div className="space-y-2">
                    {[
                      'NODE_ENV=production',
                      'PORT=3001', 
                      'RTMP_PORT=1935',
                      'HTTP_PORT=8080'
                    ].map((env, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <code className="bg-slate-800 px-2 py-1 rounded text-sm flex-1">{env}</code>
                        <Button 
                          onClick={() => copyToClipboard(env, 'Environment variable')}
                          variant="ghost" 
                          size="sm"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">3. Your URLs will be:</p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-sm">
                    <p>• RTMP: <code>rtmp://your-app.railway.app/live</code></p>
                    <p>• API: <code>https://your-app.railway.app</code></p>
                    <p>• WebSocket: <code>wss://your-app.railway.app</code></p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <strong>Cost:</strong> Free tier available, then ~$5/month
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="digitalocean" className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-3">DigitalOcean App Platform</h4>
              
              <div className="space-y-3 text-sm">
                <p>1. Go to DigitalOcean App Platform → Create App</p>
                <p>2. Connect your GitHub repository</p>
                <p>3. Set source directory to <code className="bg-muted px-1 rounded">/server</code></p>
                <p>4. Add the same environment variables as Railway</p>
                <p>5. Deploy and get your production URLs</p>
                
                <Button 
                  onClick={() => window.open('https://cloud.digitalocean.com/apps', '_blank')}
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open DigitalOcean
                </Button>
                
                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Cost:</strong> ~$12/month for basic plan
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="heroku" className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-3">Heroku Deployment</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Deploy with Heroku CLI:</p>
                  <div className="bg-slate-800 p-3 rounded font-mono text-sm">
                    heroku create your-streaming-app<br/>
                    git subtree push --prefix server heroku main<br/>
                    heroku config:set NODE_ENV=production
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.open('https://dashboard.heroku.com', '_blank')}
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Heroku
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  <strong>Cost:</strong> ~$25/month minimum
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </GlassmorphicCard>

      {/* Frontend Configuration */}
      <GlassmorphicCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Frontend Configuration
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            After deploying your streaming server, update these URLs in your environment:
          </p>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Environment Variables to Set:</Label>
              <div className="bg-slate-800 p-3 rounded font-mono text-sm mt-2">
                <div className="space-y-1">
                  <div>VITE_STREAMING_SERVER_URL=wss://your-streaming-server.railway.app</div>
                  <div>VITE_RTMP_URL=rtmp://your-streaming-server.railway.app/live</div>
                  <div>VITE_HLS_BASE_URL=https://your-streaming-server.railway.app</div>
                </div>
              </div>
              <Button 
                onClick={() => copyToClipboard(`VITE_STREAMING_SERVER_URL=wss://your-streaming-server.railway.app
VITE_RTMP_URL=rtmp://your-streaming-server.railway.app/live
VITE_HLS_BASE_URL=https://your-streaming-server.railway.app`, 'Environment configuration')}
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Configuration
              </Button>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Testing Guide */}
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
    </div>
  );
};
