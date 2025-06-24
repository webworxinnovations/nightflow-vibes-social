
export const OBSSetupReminder = ({ obsServerUrl }: { obsServerUrl: string }) => {
  return (
    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <h4 className="font-medium text-blue-400 mb-2">Correct OBS Setup Instructions</h4>
      <ol className="text-sm space-y-1 text-muted-foreground">
        <li>1. In OBS: Settings → Stream</li>
        <li>2. Service: Select "Custom..."</li>
        <li>3. Server: <code className="bg-green-500/20 px-1 rounded text-green-400">{obsServerUrl}</code> (WITHOUT /live)</li>
        <li>4. Stream Key: Copy your stream key from above</li>
        <li>5. Click "Apply" and "OK"</li>
        <li>6. Click "Start Streaming" in OBS main window</li>
      </ol>
      <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs">
        <strong className="text-orange-400">⚠️ Common Mistake:</strong> Don't include "/live" in the server field - OBS adds this automatically!
      </div>
    </div>
  );
};
