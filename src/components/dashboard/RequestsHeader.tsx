
import { Search, Cloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RequestsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const RequestsHeader = ({ searchQuery, onSearchChange }: RequestsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search requests, songs, or fans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="live">Live Requests</TabsTrigger>
        <TabsTrigger value="accepted">Accepted</TabsTrigger>
        <TabsTrigger value="stream">Live Stream</TabsTrigger>
        <TabsTrigger value="deployment" className="flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          Deploy
        </TabsTrigger>
      </TabsList>
    </div>
  );
};
