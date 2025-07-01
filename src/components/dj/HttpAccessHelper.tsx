
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { AlertTriangle, Globe, Copy } from "lucide-react";
import { toast } from "sonner";

export const HttpAccessHelper = () => {
  const [isHttps, setIsHttps] = useState(false);

  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:');
  }, []);

  const handleOpenHttpVersion = () => {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    // Properly convert HTTPS to HTTP
    const httpUrl = currentUrl.replace(/^https:\/\//, 'http://');
    console.log('Converted HTTP URL:', httpUrl);
    
    // Open in new tab
    const newWindow = window.open(httpUrl, '_blank');
    
    // Verify the window opened
    if (newWindow) {
      toast.success('Opening HTTP version in new tab...');
    } else {
      toast.error('Failed to open new tab. Please allow popups and try again.');
    }
  };

  const handleCopyHttpUrl = () => {
    const currentUrl = window.location.href;
    const httpUrl = currentUrl.replace(/^https:\/\//, 'http://');
    
    navigator.clipboard.writeText(httpUrl).then(() => {
      toast.success('HTTP URL copied to clipboard!');
      console.log('Copied HTTP URL:', httpUrl);
    }).catch(() => {
      toast.error('Failed to copy URL to clipboard');
    });
  };

  if (!isHttps) {
    return (
      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-400" />
          <p className="text-green-400 font-medium">✅ Perfect! You're using HTTP - streams should work!</p>
        </div>
        <p className="text-green-300 text-sm mt-1">
          Your HTTP connection can access your droplet server without mixed content issues.
        </p>
      </div>
    );
  }

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Mixed Content Issue Detected</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Your HTTPS app cannot connect to your HTTP droplet server. Access the HTTP version to test streaming:
        </p>
        
        <div className="flex gap-2">
          <Button onClick={handleOpenHttpVersion} className="bg-blue-600 hover:bg-blue-700">
            <Globe className="mr-2 h-4 w-4" />
            Open HTTP Version
          </Button>
          <Button onClick={handleCopyHttpUrl} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy HTTP URL
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-slate-800/50 p-3 rounded">
          <p className="font-medium mb-2">Why this happens:</p>
          <ul className="space-y-1">
            <li>• Your NightFlow app: HTTPS (secure)</li>
            <li>• Your droplet server: HTTP (insecure)</li>
            <li>• Browser blocks mixed content for security</li>
            <li>• Solution: Use HTTP version or add HTTPS to droplet</li>
          </ul>
        </div>

        <div className="text-xs text-yellow-400 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
          <p className="font-medium mb-1">⚠️ If button still opens HTTPS:</p>
          <p>Manually change the URL from <code>https://</code> to <code>http://</code> in your browser address bar</p>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
