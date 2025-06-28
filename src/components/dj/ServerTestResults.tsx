
import { Server, AlertCircle } from "lucide-react";

interface ServerTestResultsProps {
  serverTest: { available: boolean; details: string[] } | null;
}

export const ServerTestResults = ({ serverTest }: ServerTestResultsProps) => {
  if (!serverTest) return null;

  return (
    <div className={`p-4 rounded-lg border ${
      serverTest.available 
        ? 'bg-green-500/10 border-green-500/20' 
        : 'bg-red-500/10 border-red-500/20'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Server className="h-5 w-5" />
        <span className="font-medium">
          {serverTest.available ? '✅ Server Status: Online' : '❌ Server Status: Offline'}
        </span>
      </div>
      <div className="text-sm space-y-1">
        {serverTest.details.map((detail, index) => (
          <p key={index} className={
            detail.includes('✅') ? 'text-green-400' : 
            detail.includes('❌') ? 'text-red-400' : 
            detail.includes('🚨') || detail.includes('💡') ? 'font-medium text-yellow-400' :
            'text-muted-foreground'
          }>
            {detail}
          </p>
        ))}
      </div>
      
      {!serverTest.available && (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <p className="text-yellow-400 font-medium mb-2">⚠️ Action Required:</p>
          <p className="text-sm text-yellow-300">
            Your DigitalOcean streaming server appears to be offline. Please check your droplet status 
            and restart the streaming services if needed.
          </p>
        </div>
      )}
    </div>
  );
};
