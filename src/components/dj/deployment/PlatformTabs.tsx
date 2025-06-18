
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export const PlatformTabs = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
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
  );
};
