
interface OBSInstructionsProps {
  streamKey: string;
  rtmpUrl: string;
}

export const OBSInstructions = ({ streamKey, rtmpUrl }: OBSInstructionsProps) => {
  return (
    <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
      <h4 className="font-medium text-slate-300 mb-3">📋 OBS Setup Steps:</h4>
      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
        <li>Open OBS Studio</li>
        <li>Go to Settings → Stream</li>
        <li>Service: Select "Custom..."</li>
        <li>Server: {rtmpUrl || "rtmp://67.205.179.77:1935/live"}</li>
        <li>Stream Key: {streamKey.slice(0, 12)}...</li>
        <li>Click Apply → OK</li>
        <li>Click "Start Streaming" in OBS</li>
        <li>Your stream will appear in NightFlow!</li>
      </ol>
    </div>
  );
};
