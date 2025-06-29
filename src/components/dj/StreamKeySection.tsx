
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { useStreamKey } from "@/hooks/useStreamKey";

interface StreamKeySectionProps {
  onStreamKeyGenerated: () => void;
}

export const StreamKeySection = ({ onStreamKeyGenerated }: StreamKeySectionProps) => {
  const { generateStreamKey } = useStreamKey();

  const handleGenerateStreamKey = async () => {
    try {
      await generateStreamKey();
      toast.success('✅ Stream key generated! Copy the settings below into OBS.');
      onStreamKeyGenerated();
    } catch (error) {
      console.error('Failed to generate stream key:', error);
      toast.error('Failed to generate stream key');
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerateStreamKey}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Play className="mr-2 h-4 w-4" />
        Generate Stream Key
      </Button>
    </div>
  );
};
