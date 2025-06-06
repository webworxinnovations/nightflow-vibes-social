
import { TabsContent } from "@/components/ui/tabs";
import { SongRequestCard } from "@/components/cards/song-request-card";
import { Music, BarChart3 } from "lucide-react";
import { SongRequest } from "@/lib/mock-data";

interface RequestsTabsContentProps {
  filteredRequests: SongRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export const RequestsTabsContent = ({ 
  filteredRequests, 
  onAccept, 
  onDecline 
}: RequestsTabsContentProps) => {
  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const historyRequests = filteredRequests.filter(req => req.status !== 'pending');

  return (
    <>
      <TabsContent value="live" className="mt-4 space-y-4">
        {pendingRequests.map(request => (
          <SongRequestCard
            key={request.id}
            request={request}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        ))}
        
        {pendingRequests.length === 0 && (
          <div className="py-12 text-center">
            <Music className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No pending requests</h3>
            <p className="text-muted-foreground">
              When fans request songs, they'll appear here
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="history" className="mt-4 space-y-4">
        {historyRequests.map(request => (
          <SongRequestCard
            key={request.id}
            request={request}
          />
        ))}
        
        {historyRequests.length === 0 && (
          <div className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No request history</h3>
            <p className="text-muted-foreground">
              Your past requests will be shown here
            </p>
          </div>
        )}
      </TabsContent>
    </>
  );
};
