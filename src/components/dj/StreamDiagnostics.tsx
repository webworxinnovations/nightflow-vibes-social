import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StreamDiagnosticsProps {
  streamKey: string;
  rtmpUrl: string;
  hlsUrl: string;
}

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'success' | 'failed' | 'running';
  message: string;
  details?: string;
}

export const StreamDiagnostics = ({ streamKey, rtmpUrl, hlsUrl }: StreamDiagnosticsProps) => {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: 'RTMP Server Connectivity', status: 'pending', message: 'Not tested' },
    { name: 'HLS Manifest Check', status: 'pending', message: 'Not tested' },
    { name: 'Stream Key Validation', status: 'pending', message: 'Not tested' },
    { name: 'Server Stream Status', status: 'pending', message: 'Not tested' }
  ]);

  const runDiagnostics = async () => {
    console.log('🔍 Running comprehensive stream diagnostics...');
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'running' as const, message: 'Testing...' })));

    const newTests: DiagnosticTest[] = [];

    // Test 1: RTMP Server Connectivity - use droplet IP
    try {
      console.log('🧪 Testing RTMP server connectivity via droplet IP...');
      const rtmpTest = await fetch('http://67.205.179.77:3001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (rtmpTest.ok) {
        const data = await rtmpTest.json();
        newTests.push({
          name: 'RTMP Server Connectivity',
          status: 'success',
          message: 'Server is reachable via droplet IP',
          details: `Server version: ${data.version || 'Unknown'}`
        });
      } else {
        newTests.push({
          name: 'RTMP Server Connectivity',
          status: 'failed',
          message: `Server responded with ${rtmpTest.status}`,
          details: 'RTMP server may be down or misconfigured'
        });
      }
    } catch (error) {
      newTests.push({
        name: 'RTMP Server Connectivity',
        status: 'failed',
        message: 'Cannot reach RTMP server',
        details: 'Network error or server is down'
      });
    }

    // Test 2: HLS Manifest Check
    try {
      console.log('🧪 Testing HLS manifest availability...');
      const hlsTest = await fetch(hlsUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (hlsTest.ok) {
        newTests.push({
          name: 'HLS Manifest Check',
          status: 'success',
          message: 'Stream manifest is accessible',
          details: 'OBS is successfully streaming to server'
        });
      } else {
        newTests.push({
          name: 'HLS Manifest Check',
          status: 'failed',
          message: `Manifest not found (${hlsTest.status})`,
          details: 'OBS may not be actively streaming or stream key is incorrect'
        });
      }
    } catch (error) {
      newTests.push({
        name: 'HLS Manifest Check',
        status: 'failed',
        message: 'Cannot access stream manifest',
        details: 'OBS is likely not streaming or network issue'
      });
    }

    // Test 3: Stream Key Validation
    try {
      console.log('🧪 Validating stream key format...');
      if (!streamKey || streamKey.length < 10) {
        newTests.push({
          name: 'Stream Key Validation',
          status: 'failed',
          message: 'Invalid stream key format',
          details: 'Stream key is too short or empty'
        });
      } else if (!streamKey.startsWith('nf_')) {
        newTests.push({
          name: 'Stream Key Validation',
          status: 'failed',
          message: 'Stream key format incorrect',
          details: 'Stream key should start with "nf_"'
        });
      } else {
        newTests.push({
          name: 'Stream Key Validation',
          status: 'success',
          message: 'Stream key format is valid',
          details: `Key: ${streamKey.substring(0, 15)}...`
        });
      }
    } catch (error) {
      newTests.push({
        name: 'Stream Key Validation',
        status: 'failed',
        message: 'Stream key validation failed',
        details: 'Unexpected error during validation'
      });
    }

    // Test 4: Server Stream Status - use droplet IP
    try {
      console.log('🧪 Checking server stream status...');
      const statusTest = await fetch(`http://67.205.179.77:3001/api/stream/status/${streamKey}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (statusTest.ok) {
        const data = await statusTest.json();
        newTests.push({
          name: 'Server Stream Status',
          status: data.isLive ? 'success' : 'failed',
          message: data.isLive ? 'Stream is active on server' : 'Stream is not active on server',
          details: `Server reports: ${data.isLive ? 'LIVE' : 'OFFLINE'}`
        });
      } else {
        newTests.push({
          name: 'Server Stream Status',
          status: 'failed',
          message: 'Cannot check stream status',
          details: 'Server stream status API unavailable'
        });
      }
    } catch (error) {
      newTests.push({
        name: 'Server Stream Status',
        status: 'failed',
        message: 'Stream status check failed',
        details: 'Network error or server API issue'
      });
    }

    setTests(newTests);
    console.log('🔍 Diagnostics complete:', newTests);
  };

  const getIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">PASS</Badge>;
      case 'failed':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'running':
        return <Badge variant="secondary">TESTING</Badge>;
      default:
        return <Badge variant="outline">PENDING</Badge>;
    }
  };

  useEffect(() => {
    // Auto-run diagnostics when component mounts
    runDiagnostics();
  }, [streamKey, hlsUrl]);

  return (
    <GlassmorphicCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Stream Diagnostics</h3>
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Tests
          </Button>
        </div>

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.message}</div>
                  {test.details && (
                    <div className="text-xs text-muted-foreground mt-1">{test.details}</div>
                  )}
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-lg">
          <strong>💡 Troubleshooting Tips:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>If HLS Manifest Check fails: OBS is not actively streaming (check "Start Streaming" button)</li>
            <li>If RTMP Server fails: Network connectivity issue or server is down</li>
            <li>If Stream Status fails: There may be a delay, wait 30 seconds and re-test</li>
            <li>Make sure OBS shows "Streaming" status, not just "End Stream" button</li>
            <li><strong>Use droplet IP for OBS:</strong> rtmp://67.205.179.77:1935/live</li>
          </ul>
        </div>
      </div>
    </GlassmorphicCard>
  );
};
