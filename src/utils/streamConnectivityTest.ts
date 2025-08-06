export class StreamConnectivityTest {
  static async testDropletHTTPS(): Promise<{ success: boolean; message: string; details: any }> {
    console.log('🧪 Testing HTTPS droplet connectivity...');
    
    try {
      const response = await fetch('https://67.205.179.77:3443/health', {
        method: 'GET',
        signal: AbortSignal.timeout(8000),
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        
        return {
          success: true,
          message: '✅ Droplet HTTPS server is ready for streaming!',
          details: {
            status: response.status,
            server: 'https://67.205.179.77:3443',
            rtmpUrl: 'rtmp://67.205.179.77:1935/live',
            hlsBase: 'https://67.205.179.77:3443/live',
            serverData: data
          }
        };
      } else {
        return {
          success: false,
          message: `❌ Server responded with status ${response.status}`,
          details: { status: response.status }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Cannot connect to HTTPS droplet server',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
  
  static getOBSSettings(): { server: string; streamKey: string; instructions: string[] } {
    return {
      server: 'rtmp://67.205.179.77:1935/live',
      streamKey: 'Generate from NightFlow DJ Dashboard',
      instructions: [
        '1. Open OBS Studio',
        '2. Go to Settings → Stream',  
        '3. Service: Custom',
        '4. Server: rtmp://67.205.179.77:1935/live',
        '5. Stream Key: [Copy from NightFlow]',
        '6. Click Apply → OK',
        '7. Start Streaming in OBS',
        '8. Stream will appear in NightFlow over HTTPS'
      ]
    };
  }
}