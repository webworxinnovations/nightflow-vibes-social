
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useStreamKey } from "@/hooks/useStreamKey";
import { StreamKeySection } from "./StreamKeySection";
import { OBSConnectionDetails } from "./OBSConnectionDetails";
import { OBSInstructions } from "./OBSInstructions";

export const SimpleOBSSetup = () => {
  const { streamKey, rtmpUrl } = useStreamKey();

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">OBS Streaming Setup</h3>
          </div>

          {/* Stream Key Generation */}
          <StreamKeySection onStreamKeyGenerated={() => {}} />

          {streamKey && (
            <>
              <OBSConnectionDetails 
                streamKey={streamKey}
                rtmpUrl={rtmpUrl}
              />

              <OBSInstructions 
                streamKey={streamKey}
                rtmpUrl={rtmpUrl}
              />
            </>
          )}
        </div>
      </GlassmorphicCard>
    </div>
  );
};
