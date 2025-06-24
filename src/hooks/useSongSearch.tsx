
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

export const useSongSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

  const searchSongs = async (query: string): Promise<SpotifyTrack[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);

    try {
      // Call edge function to search Spotify
      const { data, error } = await supabase.functions.invoke('search-spotify', {
        body: { query }
      });

      if (error) throw error;

      const tracks = data.tracks?.items || [];
      setSearchResults(tracks);
      return tracks;
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchSongs,
    searchResults,
    isSearching
  };
};
