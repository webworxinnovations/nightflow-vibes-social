
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { UserRole, EventFilter, GenreFilter } from "@/types/discover";

interface DiscoverFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  roleFilter: UserRole;
  setRoleFilter: (filter: UserRole) => void;
  eventFilter: EventFilter;
  setEventFilter: (filter: EventFilter) => void;
  genreFilter: GenreFilter;
  setGenreFilter: (filter: GenreFilter) => void;
  allGenres: string[];
}

export function DiscoverFilters({
  searchQuery,
  setSearchQuery,
  activeTab,
  roleFilter,
  setRoleFilter,
  eventFilter,
  setEventFilter,
  genreFilter,
  setGenreFilter,
  allGenres
}: DiscoverFiltersProps) {
  return (
    <div className="mb-6 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search DJs, events, genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Filters section */}
      <div className="flex space-x-2">
        {activeTab === "djs" ? (
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole)}>
            <SelectTrigger className="w-[120px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="dj">DJs</SelectItem>
              <SelectItem value="promoter">Promoters</SelectItem>
              <SelectItem value="venue">Venues</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select value={eventFilter} onValueChange={(value) => setEventFilter(value as EventFilter)}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live Now</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <Select value={genreFilter} onValueChange={(value) => setGenreFilter(value as GenreFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {allGenres.map(genre => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
