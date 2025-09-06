import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { socketService } from '../services/socket';
import {
  WebSocketState,
  NewOfferEvent,
  IncomingSearchEvent,
  OfferStatusEvent,
  SearchStatusEvent,
  Offer,
  Search,
} from '../types/api';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;

  // Real-time data
  newOffers: NewOfferEvent[];
  incomingSearches: IncomingSearchEvent[];
  offerStatusUpdates: OfferStatusEvent[];
  searchStatusUpdates: SearchStatusEvent[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  clearOffers: () => void;
  clearSearches: () => void;
  clearStatusUpdates: () => void;

  // Event handlers
  onNewOffer: (callback: (data: NewOfferEvent) => void) => void;
  onIncomingSearch: (callback: (data: IncomingSearchEvent) => void) => void;
  onOfferAccepted: (callback: (data: OfferStatusEvent) => void) => void;
  onOfferRejected: (callback: (data: OfferStatusEvent) => void) => void;
  onSearchStatusUpdate: (callback: (data: SearchStatusEvent) => void) => void;
  onOfferStatusUpdate: (callback: (data: OfferStatusEvent) => void) => void;

  // Remove event listeners
  removeListener: (event: string, callback?: Function) => void;
  removeAllListeners: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  });

  // Real-time data arrays
  const [newOffers, setNewOffers] = useState<NewOfferEvent[]>([]);
  const [incomingSearches, setIncomingSearches] = useState<
    IncomingSearchEvent[]
  >([]);
  const [offerStatusUpdates, setOfferStatusUpdates] = useState<
    OfferStatusEvent[]
  >([]);
  const [searchStatusUpdates, setSearchStatusUpdates] = useState<
    SearchStatusEvent[]
  >([]);

  // Refs to store callbacks
  const callbacksRef = useRef<Map<string, Function[]>>(new Map());

  // Update state from socket service
  const updateState = useCallback(() => {
    const socketState = socketService.getState();
    setState(socketState);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    try {
      await socketService.connect();
      updateState();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      updateState();
    }
  }, [updateState]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    socketService.disconnect();
    updateState();
    // Clear all real-time data
    setNewOffers([]);
    setIncomingSearches([]);
    setOfferStatusUpdates([]);
    setSearchStatusUpdates([]);
  }, [updateState]);

  // Reconnect to WebSocket
  const reconnect = useCallback(async () => {
    try {
      await socketService.reconnect();
      updateState();
    } catch (error) {
      console.error('Failed to reconnect to WebSocket:', error);
      updateState();
    }
  }, [updateState]);

  // Test connection
  const testConnection = useCallback(async () => {
    return await socketService.testConnection();
  }, []);

  // Clear data arrays
  const clearOffers = useCallback(() => {
    setNewOffers([]);
  }, []);

  const clearSearches = useCallback(() => {
    setIncomingSearches([]);
  }, []);

  const clearStatusUpdates = useCallback(() => {
    setOfferStatusUpdates([]);
    setSearchStatusUpdates([]);
  }, []);

  // Event handler registration
  const onNewOffer = useCallback((callback: (data: NewOfferEvent) => void) => {
    const wrappedCallback = (data: NewOfferEvent) => {
      setNewOffers((prev) => [...prev, data]);
      callback(data);
    };

    socketService.onNewOffer(wrappedCallback);

    // Store callback for cleanup
    if (!callbacksRef.current.has('offers:new')) {
      callbacksRef.current.set('offers:new', []);
    }
    callbacksRef.current.get('offers:new')!.push(wrappedCallback);
  }, []);

  const onIncomingSearch = useCallback(
    (callback: (data: IncomingSearchEvent) => void) => {
      const wrappedCallback = (data: IncomingSearchEvent) => {
        setIncomingSearches((prev) => [...prev, data]);
        callback(data);
      };

      socketService.onIncomingSearch(wrappedCallback);

      if (!callbacksRef.current.has('search:incoming')) {
        callbacksRef.current.set('search:incoming', []);
      }
      callbacksRef.current.get('search:incoming')!.push(wrappedCallback);
    },
    []
  );

  const onOfferAccepted = useCallback(
    (callback: (data: OfferStatusEvent) => void) => {
      const wrappedCallback = (data: OfferStatusEvent) => {
        setOfferStatusUpdates((prev) => [...prev, data]);
        callback(data);
      };

      socketService.onOfferAccepted(wrappedCallback);

      if (!callbacksRef.current.has('offer:accepted')) {
        callbacksRef.current.set('offer:accepted', []);
      }
      callbacksRef.current.get('offer:accepted')!.push(wrappedCallback);
    },
    []
  );

  const onOfferRejected = useCallback(
    (callback: (data: OfferStatusEvent) => void) => {
      const wrappedCallback = (data: OfferStatusEvent) => {
        setOfferStatusUpdates((prev) => [...prev, data]);
        callback(data);
      };

      socketService.onOfferRejected(wrappedCallback);

      if (!callbacksRef.current.has('offer:rejected')) {
        callbacksRef.current.set('offer:rejected', []);
      }
      callbacksRef.current.get('offer:rejected')!.push(wrappedCallback);
    },
    []
  );

  const onSearchStatusUpdate = useCallback(
    (callback: (data: SearchStatusEvent) => void) => {
      const wrappedCallback = (data: SearchStatusEvent) => {
        setSearchStatusUpdates((prev) => [...prev, data]);
        callback(data);
      };

      socketService.onSearchStatusUpdate(wrappedCallback);

      if (!callbacksRef.current.has('search:status_update')) {
        callbacksRef.current.set('search:status_update', []);
      }
      callbacksRef.current.get('search:status_update')!.push(wrappedCallback);
    },
    []
  );

  const onOfferStatusUpdate = useCallback(
    (callback: (data: OfferStatusEvent) => void) => {
      const wrappedCallback = (data: OfferStatusEvent) => {
        setOfferStatusUpdates((prev) => [...prev, data]);
        callback(data);
      };

      socketService.onOfferStatusUpdate(wrappedCallback);

      if (!callbacksRef.current.has('offer:status_update')) {
        callbacksRef.current.set('offer:status_update', []);
      }
      callbacksRef.current.get('offer:status_update')!.push(wrappedCallback);
    },
    []
  );

  // Remove specific listener
  const removeListener = useCallback((event: string, callback?: Function) => {
    if (callback) {
      socketService.off(event as any, callback as any);
    } else {
      socketService.off(event as any);
    }
  }, []);

  // Remove all listeners
  const removeAllListeners = useCallback(() => {
    socketService.removeAllListeners();
    callbacksRef.current.clear();
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user, connect, disconnect]);

  // Update state periodically
  useEffect(() => {
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeAllListeners();
    };
  }, [removeAllListeners]);

  const value: WebSocketContextType = {
    // Connection state
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    lastConnected: state.lastConnected,
    reconnectAttempts: state.reconnectAttempts,

    // Real-time data
    newOffers,
    incomingSearches,
    offerStatusUpdates,
    searchStatusUpdates,

    // Actions
    connect,
    disconnect,
    reconnect,
    testConnection,
    clearOffers,
    clearSearches,
    clearStatusUpdates,

    // Event handlers
    onNewOffer,
    onIncomingSearch,
    onOfferAccepted,
    onOfferRejected,
    onSearchStatusUpdate,
    onOfferStatusUpdate,

    // Remove listeners
    removeListener,
    removeAllListeners,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
