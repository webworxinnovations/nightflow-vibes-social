
interface StreamingStatusProps {
  isStreaming: boolean;
}

export const StreamingStatus = ({ isStreaming }: StreamingStatusProps) => {
  if (!isStreaming) return null;

  return (
    <div className="flex items-center gap-2 text-red-500">
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      LIVE
    </div>
  );
};
