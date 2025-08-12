import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { StreamSecurity } from '@/utils/streamingSecurity';

interface SecureStreamKeyDisplayProps {
  streamKey: string;
  rtmpUrl: string;
  hlsUrl: string;
  onRegenerateKey?: () => void;
  isGenerating?: boolean;
}

export const SecureStreamKeyDisplay: React.FC<SecureStreamKeyDisplayProps> = ({
  streamKey,
  rtmpUrl,
  hlsUrl,
  onRegenerateKey,
  isGenerating = false
}) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const isExpired = StreamSecurity.isStreamKeyExpired(streamKey);
  const isValid = StreamSecurity.validateStreamKeyFormat(streamKey);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast.success(`${label} copied to clipboard`);
      
      // Log security event
      StreamSecurity.logSecurityEvent('stream_key_copied', {
        label,
        sanitizedKey: StreamSecurity.sanitizeStreamKey(streamKey)
      });
      
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, [streamKey]);

  const handleRegenerateKey = useCallback(() => {
    if (!StreamSecurity.canGenerateStreamKey()) {
      return;
    }
    
    StreamSecurity.logSecurityEvent('stream_key_regeneration_requested', {
      oldKeySanitized: StreamSecurity.sanitizeStreamKey(streamKey)
    });
    
    onRegenerateKey?.();
  }, [streamKey, onRegenerateKey]);

  const toggleKeyVisibility = useCallback(() => {
    setShowKey(prev => {
      const newState = !prev;
      StreamSecurity.logSecurityEvent('stream_key_visibility_toggled', {
        visible: newState,
        sanitizedKey: StreamSecurity.sanitizeStreamKey(streamKey)
      });
      return newState;
    });
  }, [streamKey]);

  const displayKey = showKey ? streamKey : '•'.repeat(streamKey.length);

  return (
    <div className="space-y-4">
      {!isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invalid stream key format detected. Please regenerate your stream key.
          </AlertDescription>
        </Alert>
      )}

      {isExpired && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your stream key has expired. Please regenerate a new key to continue streaming.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Stream Credentials
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isValid && !isExpired ? "default" : "destructive"}>
              {isValid && !isExpired ? "Valid" : "Invalid"}
            </Badge>
            {onRegenerateKey && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerateKey}
                disabled={isGenerating}
                className="h-8"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">RTMP Server</label>
            <div className="flex gap-2">
              <Input 
                value={rtmpUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(rtmpUrl, 'RTMP URL')}
                className="shrink-0"
              >
                <Copy className="h-3 w-3" />
                {copiedItem === 'RTMP URL' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stream Key</label>
            <div className="flex gap-2">
              <Input 
                value={displayKey} 
                readOnly 
                className="font-mono text-sm"
                type={showKey ? "text" : "password"}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={toggleKeyVisibility}
                className="shrink-0"
              >
                {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(streamKey, 'Stream Key')}
                className="shrink-0"
              >
                <Copy className="h-3 w-3" />
                {copiedItem === 'Stream Key' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">HLS Playback URL</label>
            <div className="flex gap-2">
              <Input 
                value={hlsUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(hlsUrl, 'HLS URL')}
                className="shrink-0"
              >
                <Copy className="h-3 w-3" />
                {copiedItem === 'HLS URL' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Security Notice:</strong> Keep your stream key private. Anyone with access to your stream key can broadcast to your channel. 
              Stream keys expire after 24 hours for security.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};