
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleStreamSetup } from "./SimpleStreamSetup";
import { BrowserStreamingPanel } from "./BrowserStreamingPanel";
import { Monitor, Videotape } from "lucide-react";

export const CleanLiveStreamManager = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Live Streaming</h2>
        <p className="text-muted-foreground">
          Choose your preferred streaming method below
        </p>
      </div>

      <Tabs defaultValue="obs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="obs" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            OBS Streaming
          </TabsTrigger>
          <TabsTrigger value="browser" className="flex items-center gap-2">
            <Videotape className="h-4 w-4" />
            Browser Streaming
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="obs" className="mt-6">
          <SimpleStreamSetup />
        </TabsContent>
        
        <TabsContent value="browser" className="mt-6">
          <BrowserStreamingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
