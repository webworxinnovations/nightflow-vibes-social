import { streamingService } from '@/services/streamingService';

export class StreamDiagnostics {
  static async runCompleteTest(): Promise<{
    success: boolean;
    results: Array<{
      test: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      details?: any;
    }>;
  }> {
    const results = [];
    let overallSuccess = true;

    console.group('🧪 NIGHTFLOW STREAMING DIAGNOSTICS');
    
    // Test 1: Droplet HTTP connectivity
    try {
      console.log('1️⃣ Testing droplet HTTP connectivity...');
      const httpResponse = await fetch('http://67.205.179.77:3001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (httpResponse.ok) {
        const data = await httpResponse.json();
        results.push({
          test: 'HTTP Connectivity',
          status: 'pass',
          message: 'Droplet HTTP server responding',
          details: data
        });
      } else {
        results.push({
          test: 'HTTP Connectivity', 
          status: 'fail',
          message: `HTTP server error: ${httpResponse.status}`
        });
        overallSuccess = false;
      }
    } catch (error) {
      results.push({
        test: 'HTTP Connectivity',
        status: 'fail', 
        message: `HTTP connection failed: ${error.message}`
      });
      overallSuccess = false;
    }

    // Test 2: Droplet HTTPS connectivity
    try {
      console.log('2️⃣ Testing droplet HTTPS connectivity...');
      const httpsResponse = await fetch('https://67.205.179.77:3443/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (httpsResponse.ok) {
        const data = await httpsResponse.json();
        results.push({
          test: 'HTTPS Connectivity',
          status: 'pass',
          message: 'Droplet HTTPS server responding with SSL',
          details: data
        });
      } else {
        results.push({
          test: 'HTTPS Connectivity',
          status: 'fail', 
          message: `HTTPS server error: ${httpsResponse.status}`
        });
        overallSuccess = false;
      }
    } catch (error) {
      results.push({
        test: 'HTTPS Connectivity',
        status: 'fail',
        message: `HTTPS connection failed: ${error.message}`
      });
      overallSuccess = false;
    }

    // Test 3: Stream key generation
    try {
      console.log('3️⃣ Testing stream key generation...');
      const config = await streamingService.generateStreamKey();
      
      if (config.streamKey.startsWith('nf_') && config.hlsUrl && config.rtmpUrl) {
        results.push({
          test: 'Stream Key Generation',
          status: 'pass',
          message: 'Stream key generated successfully',
          details: config
        });
      } else {
        results.push({
          test: 'Stream Key Generation',
          status: 'fail',
          message: 'Invalid stream key format or missing URLs'
        });
        overallSuccess = false;
      }
    } catch (error) {
      results.push({
        test: 'Stream Key Generation',
        status: 'fail',
        message: `Stream key generation failed: ${error.message}`
      });
      overallSuccess = false;
    }

    // Test 4: Stream validation endpoint
    try {
      console.log('4️⃣ Testing stream validation...');
      const testKey = 'nf_test_123';
      const validationResponse = await fetch(`https://67.205.179.77:3443/api/validate/${testKey}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (validationResponse.ok) {
        const data = await validationResponse.json();
        results.push({
          test: 'Stream Validation',
          status: 'pass',
          message: 'Stream validation endpoint working',
          details: data
        });
      } else {
        results.push({
          test: 'Stream Validation',
          status: 'fail',
          message: `Validation endpoint error: ${validationResponse.status}`
        });
        overallSuccess = false;
      }
    } catch (error) {
      results.push({
        test: 'Stream Validation',
        status: 'fail',
        message: `Validation test failed: ${error.message}`
      });
      overallSuccess = false;
    }

    // Test 5: HLS endpoint accessibility
    try {
      console.log('5️⃣ Testing HLS endpoint...');
      const testKey = 'nf_test_123';
      const hlsResponse = await fetch(`https://67.205.179.77:3443/live/${testKey}/index.m3u8`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      // 404 is expected for non-existent stream, but should have CORS headers
      const corsHeader = hlsResponse.headers.get('Access-Control-Allow-Origin');
      if (corsHeader) {
        results.push({
          test: 'HLS Endpoint',
          status: 'pass',
          message: 'HLS endpoint accessible with CORS',
          details: { corsHeader, status: hlsResponse.status }
        });
      } else {
        results.push({
          test: 'HLS Endpoint',
          status: 'warning',
          message: 'HLS endpoint reachable but missing CORS headers'
        });
      }
    } catch (error) {
      results.push({
        test: 'HLS Endpoint',
        status: 'fail',
        message: `HLS endpoint failed: ${error.message}`
      });
      overallSuccess = false;
    }

    // Test 6: Check if PM2 process is running
    try {
      console.log('6️⃣ Testing server status via API...');
      const statusResponse = await fetch('https://67.205.179.77:3443/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        results.push({
          test: 'Server Status',
          status: 'pass',
          message: 'API health endpoint responding',
          details: data
        });
      } else {
        results.push({
          test: 'Server Status',
          status: 'fail',
          message: `API health check failed: ${statusResponse.status}`
        });
        overallSuccess = false;
      }
    } catch (error) {
      results.push({
        test: 'Server Status',
        status: 'fail',
        message: `Server status check failed: ${error.message}`
      });
      overallSuccess = false;
    }

    console.groupEnd();
    
    // Summary
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warnCount = results.filter(r => r.status === 'warning').length;
    
    console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);
    
    return { success: overallSuccess, results };
  }
}