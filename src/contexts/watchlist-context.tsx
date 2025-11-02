'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useToast } from '@/hooks/use-toast';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (movieId: string, movieTitle: string) => void;
  removeFromWatchlist: (movieId: string, movieTitle: string) => void;
  isInWatchlist: (movieId: string) => boolean;
  isLoaded: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem('cineview-watchlist');
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (error) {
      console.error('Failed to parse watchlist from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cineview-watchlist', JSON.stringify(watchlist));
      } catch (error) {
        console.error('Failed to save watchlist to localStorage', error);
      }
    }
  }, [watchlist, isLoaded]);

  const addToWatchlist = useCallback(
    (movieId: string, movieTitle: string) => {
      if (!isLoaded) return;
      setWatchlist((prev) => {
        if (prev.includes(movieId)) {
          return prev;
        }
        toast({
          title: 'Added to Watchlist',
          description: `"${movieTitle}" has been added to your watchlist.`,
        });
        return [...prev, movieId];
      });
    },
    [isLoaded, toast]
  );

  const removeFromWatchlist = useCallback(
    (movieId: string, movieTitle: string) => {
      if (!isLoaded) return;
      setWatchlist((prev) => {
        if (!prev.includes(movieId)) {
          return prev;
        }
        toast({
          title: 'Removed from Watchlist',
          description: `"${movieTitle}" has been removed from your watchlist.`,
        });
        return prev.filter((id) => id !== movieId);
      });
    },
    [isLoaded, toast]
  );

  const isInWatchlist = useCallback(
    (movieId: string) => {
      if (!isLoaded) return false;
      return watchlist.includes(movieId);
    },
    [isLoaded, watchlist]
  );

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        isLoaded,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
