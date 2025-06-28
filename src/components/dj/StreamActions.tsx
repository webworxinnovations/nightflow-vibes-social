
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";

interface StreamActionsProps {
  onGenerateNewKey: () => Promise<void>;
  onClearAndRegenerate: () => Promise<void>;
}

export const StreamActions = ({ 
  onGenerateNewKey, 
  onClearAndRegenerate 
}: StreamActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onGenerateNewKey}
        variant="outline"
        size="sm"
        className="flex-1"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Generate New Stream Key
      </Button>
      <Button
        onClick={onClearAndRegenerate}
        variant="destructive"
        size="sm"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear & Reset
      </Button>
    </div>
  );
};
