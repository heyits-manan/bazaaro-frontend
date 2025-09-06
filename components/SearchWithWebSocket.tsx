import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useCustomerSearchWebSocket } from '../hooks/useSearchWebSocket';
import { useWebSocketConnection } from '../hooks/useWebSocket';
import { WebSocketStatus } from './WebSocketStatus';
import { RealtimeNotification } from './RealtimeNotification';
import { OfferCard } from './ui/OfferCard';
import { Search, Offer } from '../types/api';

interface SearchWithWebSocketProps {
  searchId?: string;
  onOfferPress?: (offer: Offer) => void;
  onSearchUpdate?: (search: Search) => void;
}

export function SearchWithWebSocket({
  searchId,
  onOfferPress,
  onSearchUpdate,
}: SearchWithWebSocketProps) {
  const { isConnected, error, reconnect } = useWebSocketConnection();
  const {
    activeSearches,
    searchOffers,
    addSearch,
    removeSearch,
    getOffersForSearch,
    getActiveSearch,
    clearAllData,
  } = useCustomerSearchWebSocket();

  const [refreshing, setRefreshing] = useState(false);

  // Get current search and its offers
  const currentSearch = searchId ? getActiveSearch(searchId) : null;
  const currentOffers = searchId ? getOffersForSearch(searchId) : [];

  // Handle new offers
  const handleNewOffer = useCallback((data: any) => {
    console.log('New offer received:', data);
    // The offer is automatically added to searchOffers by the hook
  }, []);

  // Handle offer status updates
  const handleOfferStatusUpdate = useCallback((data: any) => {
    console.log('Offer status updated:', data);
    // The status is automatically updated by the hook
  }, []);

  // Handle search status updates
  const handleSearchStatusUpdate = useCallback(
    (data: any) => {
      console.log('Search status updated:', data);
      onSearchUpdate?.(data);
    },
    [onSearchUpdate]
  );

  // Set up WebSocket listeners
  useEffect(() => {
    if (isConnected) {
      // These are handled by the hooks, but you can add additional custom logic here
      console.log('WebSocket connected, setting up listeners');
    }
  }, [isConnected]);

  // Add a search when searchId changes
  useEffect(() => {
    if (searchId && !currentSearch) {
      // This would typically come from your API call
      const newSearch: Search = {
        id: searchId,
        userId: 1, // This should come from your auth context
        productName: 'Sample Product',
        latitude: '40.7128',
        longitude: '-74.0060',
        status: 'pending',
        selectedOfferId: null,
        createdAt: new Date().toISOString(),
      };
      addSearch(newSearch);
    }
  }, [searchId, currentSearch, addSearch]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (!isConnected) {
        await reconnect();
      }
      // Add any additional refresh logic here
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isConnected, reconnect]);

  // Handle notification press
  const handleNotificationPress = useCallback((notification: any) => {
    console.log('Notification pressed:', notification);
    // Navigate to relevant screen or show details
  }, []);

  // Handle offer press
  const handleOfferPress = useCallback(
    (offer: Offer) => {
      onOfferPress?.(offer);
    },
    [onOfferPress]
  );

  return (
    <View style={styles.container}>
      {/* WebSocket Status */}
      <WebSocketStatus showDetails={!!error} onReconnect={reconnect} />

      {/* Real-time Notifications */}
      <RealtimeNotification onPress={handleNotificationPress} />

      {/* Search Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {currentSearch ? (
          <View style={styles.searchContainer}>
            <Text style={styles.searchTitle}>
              Search: {currentSearch.productName}
            </Text>
            <Text style={styles.searchStatus}>
              Status: {currentSearch.status}
            </Text>

            <Text style={styles.offersTitle}>
              Offers ({currentOffers.length})
            </Text>

            {currentOffers.length > 0 ? (
              currentOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  searchId={searchId || ''}
                  onAccept={(offerId) => {
                    // Handle offer acceptance
                    console.log('Accept offer:', offerId);
                  }}
                  onReject={(offerId) => {
                    // Handle offer rejection
                    console.log('Reject offer:', offerId);
                  }}
                  onViewLocation={(offer) => {
                    // Handle view location
                    console.log('View location for offer:', offer);
                  }}
                  canAct={true}
                />
              ))
            ) : (
              <View style={styles.noOffersContainer}>
                <Text style={styles.noOffersText}>
                  {isConnected
                    ? 'Waiting for offers...'
                    : 'Connect to receive real-time offers'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noSearchContainer}>
            <Text style={styles.noSearchText}>No active search</Text>
            {!isConnected && (
              <Text style={styles.disconnectedText}>
                Connect to start receiving real-time updates
              </Text>
            )}
          </View>
        )}

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>
              Connected: {isConnected ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Active Searches: {activeSearches.length}
            </Text>
            <Text style={styles.debugText}>
              Total Offers: {Object.values(searchOffers).flat().length}
            </Text>
            {error && <Text style={styles.debugText}>Error: {error}</Text>}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  searchStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  offersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noOffersContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noOffersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noSearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noSearchText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  disconnectedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  debugContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});
