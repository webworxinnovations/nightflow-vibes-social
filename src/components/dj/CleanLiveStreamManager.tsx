
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleStreamSetup } from "./SimpleStreamSetup";
import { Monitor } from "lucide-react";
import { useRealTimeStream } from "@/hooks/useRealTimeStream";

export const CleanLiveStreamManager = () => {
  const { streamConfig } = useRealTimeStream();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Live Streaming</h2>
        <p className="text-muted-foreground">
          Choose your preferred streaming method below
        </p>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Monitor className="h-5 w-5" />
          <h3 className="text-lg font-semibold">OBS Streaming Setup</h3>
        </div>
        <SimpleStreamSetup />
      </div>
    </div>
  );
};
