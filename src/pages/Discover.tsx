
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import { UsersContent } from "@/components/discover/UsersContent";
import { EventsContent } from "@/components/discover/EventsContent";
import { GenreBrowser } from "@/components/discover/GenreBrowser";
import { useDiscoverFilters } from "@/hooks/useDiscoverFilters";

export default function Discover() {
  const { profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("djs");
  
  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    eventFilter,
    setEventFilter,
    genreFilter,
    setGenreFilter,
    allGenres,
    filteredUsers,
    filteredEvents
  } = useDiscoverFilters();
  
  // Check if user has creator role (dj, promoter, venue)
  const isCreatorRole = () => {
    if (!profile) return false;
    return ["dj", "promoter", "venue"].includes(profile.role);
  };
  
  return (
    <div>
      <DiscoverHeader isCreatorRole={isCreatorRole()} />
      
      <DiscoverFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        eventFilter={eventFilter}
        setEventFilter={setEventFilter}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        allGenres={allGenres}
      />
      
      <Tabs defaultValue="djs" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="djs">DJs & Venues</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="djs">
          <UsersContent filteredUsers={filteredUsers} />
        </TabsContent>
        
        <TabsContent value="events">
          <EventsContent filteredEvents={filteredEvents} />
        </TabsContent>
      </Tabs>
      
      {activeTab === "djs" && filteredUsers.length > 0 && (
        <GenreBrowser
          allGenres={allGenres}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
        />
      )}
    </div>
  );
}
