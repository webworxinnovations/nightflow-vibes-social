
import { useState, useMemo } from "react";
import { users, events } from "@/lib/mock-data";
import { Event } from "@/hooks/useEvents";
import { UserRole, EventFilter, GenreFilter } from "@/types/discover";
import { transformMockEventToEvent } from "@/utils/eventTransformers";

export function useDiscoverFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole>('all');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  
  // Transform mock events to Event type
  const transformedEvents: Event[] = useMemo(() => 
    events.map(transformMockEventToEvent), []);
  
  // Extract all unique genres from users
  const allGenres = useMemo(() => 
    Array.from(
      new Set(
        users
          .filter(user => user.genres)
          .flatMap(user => user.genres || [])
      )
    ).sort(), []);
  
  // Filter users based on search, role, and genre
  const filteredUsers = useMemo(() => 
    users.filter((user) => {
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      
      // Genre filter
      if (genreFilter !== 'all' && 
          (!user.genres || !user.genres.some(genre => 
            genre.toLowerCase() === genreFilter.toLowerCase()
          ))
      ) {
        return false;
      }
      
      // Search query filter
      if (searchQuery) {
        return (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.genres && user.genres.some(genre => 
            genre.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
          (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      return true;
    }), [roleFilter, genreFilter, searchQuery]);
  
  // Filter events based on search, filter type, and associated DJs/venues/promoters
  const filteredEvents = useMemo(() => 
    transformedEvents.filter((event) => {
      // Event type filter
      if (eventFilter === 'upcoming' && event.isLive) {
        return false;
      }
      if (eventFilter === 'live' && !event.isLive) {
        return false;
      }
      
      // Genre filter (check if any DJ in the lineup matches the genre)
      if (genreFilter !== 'all') {
        const hasMatchingDj = event.lineup && event.lineup.some(dj => 
          dj.genres && dj.genres.includes(genreFilter)
        );
        if (!hasMatchingDj) {
          return false;
        }
      }
      
      // Search query filter
      if (searchQuery) {
        return (
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.lineup && event.lineup.some(dj => 
            dj.name.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
          (event.address && event.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.promoter && event.promoter.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      return true;
    }), [transformedEvents, eventFilter, genreFilter, searchQuery]);

  return {
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
  };
}
