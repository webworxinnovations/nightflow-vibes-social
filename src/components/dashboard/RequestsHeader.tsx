
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface RequestsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const RequestsHeader = ({ searchQuery, onSearchChange }: RequestsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <TabsList>
        <TabsTrigger value="live">Live Requests</TabsTrigger>
        <TabsTrigger value="history">Request History</TabsTrigger>
        <TabsTrigger value="stream">Live Stream</TabsTrigger>
      </TabsList>
      
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
  );
};
