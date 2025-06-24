
import { Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ServerDiagnosticsSectionProps {
  diagnostics: any;
}

export const ServerDiagnosticsSection = ({ diagnostics }: ServerDiagnosticsSectionProps) => {
  if (!diagnostics) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <Server className="h-4 w-4" />
        Server Diagnostics
      </h4>
      
      {/* RTMP Status */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="font-medium">RTMP Server Status</span>
        <Badge variant={diagnostics.rtmpStatus.ready ? "default" : "destructive"}>
          {diagnostics.rtmpStatus.ready ? 'Ready' : 'Not Ready'}
        </Badge>
      </div>

      {/* Server Info */}
      {diagnostics.serverInfo && (
        <details className="border rounded-lg">
          <summary className="p-3 cursor-pointer font-medium">
            Server Information (Click to expand)
          </summary>
          <div className="p-3 pt-0">
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(diagnostics.serverInfo, null, 2)}
            </pre>
          </div>
        </details>
      )}

      {/* Recommendations */}
      {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {diagnostics.recommendations.map((rec: string, index: number) => (
                <div key={index} className="text-sm">
                  {rec.startsWith('•') || rec.startsWith('❌') || rec.startsWith('⚠️') || rec.startsWith('🚄') ? (
                    <span>{rec}</span>
                  ) : (
                    <strong>{rec}</strong>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
