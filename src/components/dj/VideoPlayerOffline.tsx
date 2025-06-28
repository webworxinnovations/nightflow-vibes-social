
interface VideoPlayerOfflineProps {
  className?: string;
}

export const VideoPlayerOffline = ({ className = "" }: VideoPlayerOfflineProps) => {
  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-2">📺</div>
          <p className="text-sm opacity-80">Stream offline</p>
        </div>
      </div>
    </div>
  );
};
