
import { CheckCircle, XCircle } from "lucide-react";

interface TestResultsSectionProps {
  testResult: any;
}

export const TestResultsSection = ({ testResult }: TestResultsSectionProps) => {
  if (!testResult) return null;

  return (
    <div className="space-y-3">
      <div className={`p-4 rounded-lg border ${
        testResult.success 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {testResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <h4 className="font-medium">
            {testResult.success ? 'Connection Test Passed' : 'Connection Issues Detected'}
          </h4>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{testResult.details}</p>
        
        {testResult.suggestions && testResult.suggestions.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">Recommendations:</h5>
            <ul className="text-sm space-y-1">
              {testResult.suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
