import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import {
  NewOfferEvent,
  IncomingSearchEvent,
  OfferStatusEvent,
  SearchStatusEvent,
} from '../types/api';

// Hook for managing new offers (customers)
export function useNewOffers() {
  const { newOffers, onNewOffer, clearOffers } = useWebSocket();

  const handleNewOffer = useCallback(
    (callback: (data: NewOfferEvent) => void) => {
      onNewOffer(callback);
    },
    [onNewOffer]
  );

  return {
    offers: newOffers,
    onNewOffer: handleNewOffer,
    clearOffers,
  };
}

// Hook for managing incoming searches (store owners)
export function useIncomingSearches() {
  const { incomingSearches, onIncomingSearch, clearSearches } = useWebSocket();

  const handleIncomingSearch = useCallback(
    (callback: (data: IncomingSearchEvent) => void) => {
      onIncomingSearch(callback);
    },
    [onIncomingSearch]
  );

  return {
    searches: incomingSearches,
    onIncomingSearch: handleIncomingSearch,
    clearSearches,
  };
}

// Hook for managing offer status updates
export function useOfferStatusUpdates() {
  const {
    offerStatusUpdates,
    onOfferAccepted,
    onOfferRejected,
    onOfferStatusUpdate,
  } = useWebSocket();

  const handleOfferAccepted = useCallback(
    (callback: (data: OfferStatusEvent) => void) => {
      onOfferAccepted(callback);
    },
    [onOfferAccepted]
  );

  const handleOfferRejected = useCallback(
    (callback: (data: OfferStatusEvent) => void) => {
      onOfferRejected(callback);
    },
    [onOfferRejected]
  );

  const handleOfferStatusUpdate = useCallback(
    (callback: (data: OfferStatusEvent) => void) => {
      onOfferStatusUpdate(callback);
    },
    [onOfferStatusUpdate]
  );

  return {
    updates: offerStatusUpdates,
    onOfferAccepted: handleOfferAccepted,
    onOfferRejected: handleOfferRejected,
    onOfferStatusUpdate: handleOfferStatusUpdate,
  };
}

// Hook for managing search status updates
export function useSearchStatusUpdates() {
  const { searchStatusUpdates, onSearchStatusUpdate } = useWebSocket();

  const handleSearchStatusUpdate = useCallback(
    (callback: (data: SearchStatusEvent) => void) => {
      onSearchStatusUpdate(callback);
    },
    [onSearchStatusUpdate]
  );

  return {
    updates: searchStatusUpdates,
    onSearchStatusUpdate: handleSearchStatusUpdate,
  };
}

// Hook for WebSocket connection management
export function useWebSocketConnection() {
  const {
    isConnected,
    isConnecting,
    error,
    lastConnected,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
    testConnection,
  } = useWebSocket();

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleReconnect = useCallback(async () => {
    try {
      await reconnect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  }, [reconnect]);

  const handleTestConnection = useCallback(async () => {
    try {
      return await testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }, [testConnection]);

  return {
    isConnected,
    isConnecting,
    error,
    lastConnected,
    reconnectAttempts,
    connect: handleConnect,
    disconnect: handleDisconnect,
    reconnect: handleReconnect,
    testConnection: handleTestConnection,
  };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const { onNewOffer, onIncomingSearch, onOfferAccepted, onOfferRejected } =
    useWebSocket();
  const notificationCallbacks = useRef<Map<string, Function[]>>(new Map());

  const addNotificationCallback = useCallback(
    (event: string, callback: Function) => {
      if (!notificationCallbacks.current.has(event)) {
        notificationCallbacks.current.set(event, []);
      }
      notificationCallbacks.current.get(event)!.push(callback);
    },
    []
  );

  const removeNotificationCallback = useCallback(
    (event: string, callback?: Function) => {
      if (callback) {
        const callbacks = notificationCallbacks.current.get(event) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      } else {
        notificationCallbacks.current.delete(event);
      }
    },
    []
  );

  // Set up notification handlers
  useEffect(() => {
    const handleNewOffer = (data: NewOfferEvent) => {
      const callbacks = notificationCallbacks.current.get('offers:new') || [];
      callbacks.forEach((callback) => callback(data));
    };

    const handleIncomingSearch = (data: IncomingSearchEvent) => {
      const callbacks =
        notificationCallbacks.current.get('search:incoming') || [];
      callbacks.forEach((callback) => callback(data));
    };

    const handleOfferAccepted = (data: OfferStatusEvent) => {
      const callbacks =
        notificationCallbacks.current.get('offer:accepted') || [];
      callbacks.forEach((callback) => callback(data));
    };

    const handleOfferRejected = (data: OfferStatusEvent) => {
      const callbacks =
        notificationCallbacks.current.get('offer:rejected') || [];
      callbacks.forEach((callback) => callback(data));
    };

    onNewOffer(handleNewOffer);
    onIncomingSearch(handleIncomingSearch);
    onOfferAccepted(handleOfferAccepted);
    onOfferRejected(handleOfferRejected);

    return () => {
      // Cleanup is handled by the context
    };
  }, [onNewOffer, onIncomingSearch, onOfferAccepted, onOfferRejected]);

  return {
    addNotificationCallback,
    removeNotificationCallback,
  };
}

// Hook for WebSocket debugging
export function useWebSocketDebug() {
  const {
    isConnected,
    isConnecting,
    error,
    lastConnected,
    reconnectAttempts,
    testConnection,
  } = useWebSocket();

  const debugInfo = {
    isConnected,
    isConnecting,
    error,
    lastConnected: lastConnected?.toISOString(),
    reconnectAttempts,
  };

  const testConnectionStatus = useCallback(async () => {
    const isWorking = await testConnection();
    console.log('WebSocket Debug Info:', {
      ...debugInfo,
      connectionTest: isWorking ? 'PASSED' : 'FAILED',
    });
    return isWorking;
  }, [testConnection, debugInfo]);

  return {
    debugInfo,
    testConnectionStatus,
  };
}
