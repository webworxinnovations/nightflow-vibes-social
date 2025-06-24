
import { useState } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

export const useSongSearch = () => {
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchSongs = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // For demo purposes, return mock data
      // In production, this would call Spotify API through Supabase Edge Function
      const mockResults: SpotifyTrack[] = [
        {
          id: '1',
          name: `${query} - Song 1`,
          artists: [{ name: 'Artist 1' }],
          album: {
            name: 'Album 1',
            images: [
              { url: '/placeholder.svg' },
              { url: '/placeholder.svg' },
              { url: '/placeholder.svg' }
            ]
          }
        },
        {
          id: '2',
          name: `${query} - Song 2`,
          artists: [{ name: 'Artist 2' }],
          album: {
            name: 'Album 2',
            images: [
              { url: '/placeholder.svg' },
              { url: '/placeholder.svg' },
              { url: '/placeholder.svg' }
            ]
          }
        }
      ];

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Song search error:', error);
      setSearchResults([]);
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
