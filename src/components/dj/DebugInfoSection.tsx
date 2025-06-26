
interface DebugInfoSectionProps {
  debugInfo?: any;
}

export const DebugInfoSection = ({ debugInfo }: DebugInfoSectionProps) => {
  if (!debugInfo) return null;

  return (
    <details className="mt-4">
      <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
        🔬 Show Technical Debug Info & Server Logs
      </summary>
      <div className="mt-2 p-3 bg-slate-800 rounded text-xs font-mono">
        <pre className="text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </details>
  );
};
