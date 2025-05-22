
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { SongRequestCard } from "@/components/cards/song-request-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  Ticket, 
  Music, 
  DollarSign,
  BarChart3,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { songRequests, songs, formatDate, events } from "@/lib/mock-data";

export default function DjDashboard() {
  const [requests, setRequests] = useState(songRequests);
  const [earnings, setEarnings] = useState(
    requests.filter(req => req.status === 'accepted').reduce((sum, req) => sum + req.tipAmount, 0)
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredRequests = requests.filter(req => {
    return req.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           req.song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
           req.fan.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleAccept = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'accepted' } : req
    ));
    
    const acceptedRequest = requests.find(req => req.id === id);
    if (acceptedRequest) {
      setEarnings(earnings + acceptedRequest.tipAmount);
    }
  };
  
  const handleDecline = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'declined' } : req
    ));
  };
  
  // Upcoming DJ Events
  const djEvents = events.slice(0, 2);
  
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">DJ Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <GlassmorphicCard className="bg-primary/10 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Total Tips</h3>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold">${earnings}</p>
              <p className="mt-1 text-xs text-muted-foreground">+$50 from last week</p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
                <Music className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{requests.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {requests.filter(r => r.status === 'accepted').length} accepted
              </p>
            </GlassmorphicCard>
            
            <GlassmorphicCard>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Upcoming Events</h3>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{djEvents.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Next: {formatDate(djEvents[0]?.date)}</p>
            </GlassmorphicCard>
          </div>
          
          <Tabs defaultValue="live" className="mt-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="live">Live Requests</TabsTrigger>
                <TabsTrigger value="history">Request History</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="live" className="mt-4 space-y-4">
              {filteredRequests
                .filter(req => req.status === 'pending')
                .map(request => (
                  <SongRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />
              ))}
              
              {filteredRequests.filter(req => req.status === 'pending').length === 0 && (
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
              {filteredRequests
                .filter(req => req.status !== 'pending')
                .map(request => (
                  <SongRequestCard
                    key={request.id}
                    request={request}
                  />
              ))}
              
              {filteredRequests.filter(req => req.status !== 'pending').length === 0 && (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No request history</h3>
                  <p className="text-muted-foreground">
                    Your past requests will be shown here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <GlassmorphicCard>
            <h2 className="text-xl font-semibold">Song Requests</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Receive song requests with tips from fans at your events
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Request Status</span>
                <span className="text-sm font-medium">
                  {requests.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>
              
              <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full bg-primary"
                  style={{ 
                    width: `${(requests.filter(r => r.status === 'accepted').length / requests.length) * 100}%` 
                  }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {requests.filter(r => r.status === 'accepted').length} Accepted
                </span>
                <span>
                  {requests.filter(r => r.status === 'declined').length} Declined
                </span>
              </div>
            </div>
            
            <Button className="mt-6 w-full">
              <Music className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <div className="mt-4 space-y-4">
              {djEvents.map(event => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-primary/10 text-center">
                      <span className="text-sm font-bold">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Ticket className="mr-1 h-3 w-3" />
                        {event.ticketsSold}/{event.maxCapacity}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {event.lineup.length} DJs
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>
          
          <GlassmorphicCard className="mt-6">
            <h2 className="text-xl font-semibold">Recently Requested</h2>
            <div className="mt-4 space-y-3">
              {songs.slice(0, 3).map((song) => (
                <div key={song.id} className="flex items-center gap-3">
                  <img
                    src={song.albumArt}
                    alt={song.title}
                    className="h-10 w-10 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{song.title}</p>
                    <p className="text-xs text-muted-foreground">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
}
