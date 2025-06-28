
export const useStreamValidation = () => {
  const validateStreamKey = (hlsUrl: string) => {
    console.group('🎬 HLS Connection Attempt');
    console.log('HLS URL:', hlsUrl);
    console.log('Expected HLS Format: http://67.205.179.77:8888/live/nf_[streamKey]/index.m3u8');
    
    const streamKeyMatch = hlsUrl.match(/\/live\/([^\/]+)\/index\.m3u8/);
    if (streamKeyMatch) {
      const streamKey = streamKeyMatch[1];
      console.log('Extracted Stream Key:', streamKey);
      if (!streamKey.startsWith('nf_')) {
        console.error('❌ INVALID STREAM KEY FORMAT - Must start with "nf_"');
        console.error('💡 SOLUTION: Generate a NEW stream key in your dashboard');
        console.groupEnd();
        return { 
          isValid: false, 
          error: '❌ Invalid stream key format. Please generate a NEW stream key that starts with "nf_".' 
        };
      }
      console.log('✅ Stream key format is correct');
    } else {
      console.error('❌ Could not extract stream key from URL');
      console.groupEnd();
      return { 
        isValid: false, 
        error: '❌ Invalid HLS URL format. Please generate a new stream key.' 
      };
    }
    
    console.groupEnd();
    return { isValid: true, error: null };
  };

  const logConnectionAttempt = (getCurrentRetryCount: () => number, maxRetries: number) => {
    console.log('🔄 Attempt:', getCurrentRetryCount() + 1, '/', maxRetries + 1);
  };

  return { validateStreamKey, logConnectionAttempt };
};
