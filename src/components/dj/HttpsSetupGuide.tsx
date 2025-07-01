
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { AlertTriangle, Shield, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const HttpsSetupGuide = () => {
  const [step, setStep] = useState(1);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard!');
  };

  return (
    <GlassmorphicCard>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-yellow-400" />
          <h3 className="text-xl font-semibold">Enable HTTPS on Your Droplet</h3>
        </div>

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-red-400 font-medium">Mixed Content Error Detected</p>
          </div>
          <p className="text-red-300 text-sm">
            Your NightFlow app (HTTPS) cannot connect to your droplet server (HTTP only). 
            You need to enable HTTPS on your droplet.
          </p>
        </div>

        <div className="space-y-4">
          <div className={`p-4 border rounded-lg ${step >= 1 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Step 1: SSH into Your Droplet</h4>
              <Button
                onClick={() => setStep(Math.max(step, 1))}
                size="sm"
                variant="outline"
              >
                {step >= 1 ? '✅' : 'Start'}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="bg-gray-800 px-2 py-1 rounded text-sm flex-1">
                  ssh your-user@67.205.179.77
                </code>
                <Button
                  onClick={() => copyCommand('ssh your-user@67.205.179.77')}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={`p-4 border rounded-lg ${step >= 2 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Step 2: Run SSL Setup Script</h4>
              <Button
                onClick={() => setStep(Math.max(step, 2))}
                size="sm"
                variant="outline"
              >
                {step >= 2 ? '✅' : 'Next'}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="bg-gray-800 px-2 py-1 rounded text-sm flex-1">
                  cd /var/www/nightflow-server && chmod +x setup-ssl-quick.sh && ./setup-ssl-quick.sh
                </code>
                <Button
                  onClick={() => copyCommand('cd /var/www/nightflow-server && chmod +x setup-ssl-quick.sh && ./setup-ssl-quick.sh')}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={`p-4 border rounded-lg ${step >= 3 ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Step 3: Test HTTPS Connection</h4>
              <Button
                onClick={() => setStep(Math.max(step, 3))}
                size="sm"
                variant="outline"
              >
                {step >= 3 ? '✅' : 'Test'}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="bg-gray-800 px-2 py-1 rounded text-sm flex-1">
                  curl -k https://67.205.179.77:3443/health
                </code>
                <Button
                  onClick={() => copyCommand('curl -k https://67.205.179.77:3443/health')}
                  size="sm"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-green-400">
                Should return: {"{"}"status":"healthy"{"}"}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-slate-800/50 p-3 rounded">
          <p className="font-medium mb-2">Why this is needed:</p>
          <ul className="space-y-1">
            <li>• Your app: HTTPS (secure)</li>
            <li>• Your droplet: HTTP only (insecure)</li>
            <li>• Browser blocks mixed content</li>
            <li>• Solution: Add HTTPS to your droplet</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => window.open('https://docs.digitalocean.com/products/droplets/how-to/configure-firewalls/', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Firewall Setup Guide
          </Button>
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            size="sm"
          >
            Reset Steps
          </Button>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
