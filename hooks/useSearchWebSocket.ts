import { useEffect, useCallback, useState, useRef } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  NewOfferEvent,
  IncomingSearchEvent,
  OfferStatusEvent,
  SearchStatusEvent,
  Search,
  Offer,
} from '../types/api';

// Hook for customer search functionality
export function useCustomerSearchWebSocket() {
  const { user } = useAuth();
  const { onNewOffer, onOfferAccepted, onOfferRejected, onSearchStatusUpdate } =
    useWebSocket();
  const [activeSearches, setActiveSearches] = useState<Map<string, Search>>(
    new Map()
  );
  const [searchOffers, setSearchOffers] = useState<Map<string, Offer[]>>(
    new Map()
  );
  const [offerStatuses, setOfferStatuses] = useState<Map<number, string>>(
    new Map()
  );

  // Handle new offers for active searches
  const handleNewOffer = useCallback(async (data: NewOfferEvent) => {
    const { searchId, offer } = data;

    // If the offer doesn't have store details, fetch the full offer details
    if (!offer.store) {
      try {
        console.log('Fetching full offer details for offer:', offer.id);
        const response = await apiService.getOffers(searchId);
        if (response.success && response.data) {
          const offers = Array.isArray(response.data)
            ? response.data
            : (response.data as any).offers || [];
          const fullOffer = offers.find((o: Offer) => o.id === offer.id);
          if (fullOffer) {
            setSearchOffers((prev) => {
              const currentOffers = prev.get(searchId) || [];
              // Replace the incomplete offer with the full offer
              const updatedOffers = currentOffers.filter(
                (o) => o.id !== offer.id
              );
              return new Map(prev).set(searchId, [...updatedOffers, fullOffer]);
            });
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch full offer details:', error);
      }
    }

    // If we have store details or fetching failed, use the original offer
    setSearchOffers((prev) => {
      const currentOffers = prev.get(searchId) || [];
      return new Map(prev).set(searchId, [...currentOffers, offer]);
    });
  }, []);

  // Handle offer status updates
  const handleOfferStatusUpdate = useCallback((data: OfferStatusEvent) => {
    const { offerId, status } = data;
    setOfferStatuses((prev) => new Map(prev).set(offerId, status));
  }, []);

  // Handle search status updates
  const handleSearchStatusUpdate = useCallback((data: SearchStatusEvent) => {
    const { searchId, status } = data;

    setActiveSearches((prev) => {
      const newMap = new Map(prev);
      const search = newMap.get(searchId);
      if (search) {
        newMap.set(searchId, { ...search, status: status as any });
      }
      return newMap;
    });
  }, []);

  // Set up event listeners
  useEffect(() => {
    onNewOffer(handleNewOffer);
    onOfferAccepted(handleOfferStatusUpdate);
    onOfferRejected(handleOfferStatusUpdate);
    onSearchStatusUpdate(handleSearchStatusUpdate);

    return () => {
      // Cleanup is handled by the context
    };
  }, [
    onNewOffer,
    onOfferAccepted,
    onOfferRejected,
    onSearchStatusUpdate,
    handleNewOffer,
    handleOfferStatusUpdate,
    handleSearchStatusUpdate,
  ]);

  // Add a new search
  const addSearch = useCallback((search: Search) => {
    setActiveSearches((prev) => new Map(prev).set(search.id, search));
    setSearchOffers((prev) => new Map(prev).set(search.id, []));
  }, []);

  // Remove a search
  const removeSearch = useCallback((searchId: string) => {
    setActiveSearches((prev) => {
      const newMap = new Map(prev);
      newMap.delete(searchId);
      return newMap;
    });
    setSearchOffers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(searchId);
      return newMap;
    });
  }, []);

  // Get offers for a specific search
  const getOffersForSearch = useCallback(
    (searchId: string) => {
      return searchOffers.get(searchId) || [];
    },
    [searchOffers]
  );

  // Get active search by ID
  const getActiveSearch = useCallback(
    (searchId: string) => {
      return activeSearches.get(searchId);
    },
    [activeSearches]
  );

  // Get all active searches
  const getAllActiveSearches = useCallback(() => {
    return Array.from(activeSearches.values());
  }, [activeSearches]);

  // Clear all data
  const clearAllData = useCallback(() => {
    setActiveSearches(new Map());
    setSearchOffers(new Map());
    setOfferStatuses(new Map());
  }, []);

  return {
    activeSearches: getAllActiveSearches(),
    searchOffers: Object.fromEntries(searchOffers),
    offerStatuses: Object.fromEntries(offerStatuses),
    addSearch,
    removeSearch,
    getOffersForSearch,
    getActiveSearch,
    clearAllData,
  };
}

// Hook for store owner search functionality
export function useStoreOwnerSearchWebSocket() {
  const { user } = useAuth();
  const { onIncomingSearch, onOfferAccepted, onOfferRejected } = useWebSocket();
  const [incomingSearches, setIncomingSearches] = useState<
    IncomingSearchEvent[]
  >([]);
  const [offerStatuses, setOfferStatuses] = useState<Map<number, string>>(
    new Map()
  );

  // Handle incoming searches
  const handleIncomingSearch = useCallback((data: IncomingSearchEvent) => {
    setIncomingSearches((prev) => [...prev, data]);
  }, []);

  // Handle offer status updates
  const handleOfferStatusUpdate = useCallback((data: OfferStatusEvent) => {
    const { offerId, status } = data;
    setOfferStatuses((prev) => new Map(prev).set(offerId, status));
  }, []);

  // Set up event listeners
  useEffect(() => {
    onIncomingSearch(handleIncomingSearch);
    onOfferAccepted(handleOfferStatusUpdate);
    onOfferRejected(handleOfferStatusUpdate);

    return () => {
      // Cleanup is handled by the context
    };
  }, [
    onIncomingSearch,
    onOfferAccepted,
    onOfferRejected,
    handleIncomingSearch,
    handleOfferStatusUpdate,
  ]);

  // Remove a search from incoming list
  const removeIncomingSearch = useCallback((searchId: string) => {
    setIncomingSearches((prev) =>
      prev.filter((search) => search.searchId !== searchId)
    );
  }, []);

  // Clear all incoming searches
  const clearIncomingSearches = useCallback(() => {
    setIncomingSearches([]);
  }, []);

  // Get offer status
  const getOfferStatus = useCallback(
    (offerId: number) => {
      return offerStatuses.get(offerId) || 'pending';
    },
    [offerStatuses]
  );

  // Clear all data
  const clearAllData = useCallback(() => {
    setIncomingSearches([]);
    setOfferStatuses(new Map());
  }, []);

  return {
    incomingSearches,
    offerStatuses: Object.fromEntries(offerStatuses),
    removeIncomingSearch,
    clearIncomingSearches,
    getOfferStatus,
    clearAllData,
  };
}

// Hook for real-time search notifications
export function useSearchNotifications() {
  const { user } = useAuth();
  const { onNewOffer, onIncomingSearch, onOfferAccepted, onOfferRejected } =
    useWebSocket();
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type:
        | 'new_offer'
        | 'incoming_search'
        | 'offer_accepted'
        | 'offer_rejected';
      data: any;
      timestamp: Date;
      read: boolean;
    }>
  >([]);

  // Add notification
  const addNotification = useCallback((type: string, data: any) => {
    const notification = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type: type as any,
      data,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleNewOffer = (data: NewOfferEvent) => {
      if (user?.role === 'user') {
        addNotification('new_offer', data);
      }
    };

    const handleIncomingSearch = (data: IncomingSearchEvent) => {
      if (user?.role === 'shop_owner') {
        addNotification('incoming_search', data);
      }
    };

    const handleOfferAccepted = (data: OfferStatusEvent) => {
      addNotification('offer_accepted', data);
    };

    const handleOfferRejected = (data: OfferStatusEvent) => {
      addNotification('offer_rejected', data);
    };

    onNewOffer(handleNewOffer);
    onIncomingSearch(handleIncomingSearch);
    onOfferAccepted(handleOfferAccepted);
    onOfferRejected(handleOfferRejected);

    return () => {
      // Cleanup is handled by the context
    };
  }, [
    user?.role,
    onNewOffer,
    onIncomingSearch,
    onOfferAccepted,
    onOfferRejected,
    addNotification,
  ]);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type: string) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getNotificationsByType,
  };
}
