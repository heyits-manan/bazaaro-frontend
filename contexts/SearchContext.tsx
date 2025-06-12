import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchContextType {
  activeSearchId: string | null;
  setActiveSearchId: (id: string | null) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);
const SEARCH_ID_KEY = '@search_id';

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [activeSearchId, setActiveSearchIdState] = useState<string | null>(
    null
  );

  // Load the search ID from storage when the component mounts
  useEffect(() => {
    const loadSearchId = async () => {
      try {
        const storedId = await AsyncStorage.getItem(SEARCH_ID_KEY);
        if (storedId) {
          console.log('Loaded search ID from storage:', storedId);
          setActiveSearchIdState(storedId);
        }
      } catch (error) {
        console.error('Error loading search ID from storage:', error);
      }
    };
    loadSearchId();
  }, []);

  // Wrapper function to update both state and storage
  const setActiveSearchId = async (id: string | null) => {
    try {
      if (id) {
        console.log('Storing search ID:', id);
        await AsyncStorage.setItem(SEARCH_ID_KEY, id);
      } else {
        console.log('Removing search ID from storage');
        await AsyncStorage.removeItem(SEARCH_ID_KEY);
      }
      setActiveSearchIdState(id);
    } catch (error) {
      console.error('Error storing search ID:', error);
    }
  };

  return (
    <SearchContext.Provider value={{ activeSearchId, setActiveSearchId }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
