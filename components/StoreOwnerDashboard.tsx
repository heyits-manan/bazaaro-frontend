import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useStoreOwnerSearchWebSocket } from '../hooks/useSearchWebSocket';
import { useWebSocketConnection } from '../hooks/useWebSocket';
import { WebSocketStatus } from './WebSocketStatus';
import { RealtimeNotification } from './RealtimeNotification';
import { Ionicons } from '@expo/vector-icons';
import { IncomingSearchEvent } from '../types/api';

interface StoreOwnerDashboardProps {
  onSearchPress?: (search: IncomingSearchEvent) => void;
  onOfferStatusUpdate?: (offerId: number, status: string) => void;
}

export function StoreOwnerDashboard({
  onSearchPress,
  onOfferStatusUpdate,
}: StoreOwnerDashboardProps) {
  const { isConnected, error, reconnect } = useWebSocketConnection();
  const {
    incomingSearches,
    offerStatuses,
    removeIncomingSearch,
    clearIncomingSearches,
    getOfferStatus,
    clearAllData,
  } = useStoreOwnerSearchWebSocket();

  const [refreshing, setRefreshing] = useState(false);

  // Handle incoming searches
  const handleIncomingSearch = useCallback((data: IncomingSearchEvent) => {
    console.log('New incoming search:', data);
    // The search is automatically added to incomingSearches by the hook
  }, []);

  // Handle offer status updates
  const handleOfferStatusUpdate = useCallback(
    (data: any) => {
      console.log('Offer status updated:', data);
      onOfferStatusUpdate?.(data.offerId, data.status);
    },
    [onOfferStatusUpdate]
  );

  // Set up WebSocket listeners
  useEffect(() => {
    if (isConnected) {
      console.log('WebSocket connected, ready to receive search requests');
    }
  }, [isConnected]);

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
  const handleNotificationPress = useCallback(
    (notification: any) => {
      console.log('Notification pressed:', notification);
      if (notification.type === 'incoming_search') {
        onSearchPress?.(notification.data);
      }
    },
    [onSearchPress]
  );

  // Handle search press
  const handleSearchPress = useCallback(
    (search: IncomingSearchEvent) => {
      onSearchPress?.(search);
    },
    [onSearchPress]
  );

  // Handle clear all searches
  const handleClearAll = useCallback(() => {
    clearIncomingSearches();
  }, [clearIncomingSearches]);

  return (
    <View style={styles.container}>
      {/* WebSocket Status */}
      <WebSocketStatus showDetails={!!error} onReconnect={reconnect} />

      {/* Real-time Notifications */}
      <RealtimeNotification onPress={handleNotificationPress} />

      {/* Dashboard Content */}
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Store Owner Dashboard</Text>
          <Text style={styles.subtitle}>
            Real-time search requests and offer management
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{incomingSearches.length}</Text>
            <Text style={styles.statLabel}>Pending Searches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {
                Object.values(offerStatuses).filter(
                  (status) => status === 'accepted'
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Accepted Offers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {
                Object.values(offerStatuses).filter(
                  (status) => status === 'rejected'
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Rejected Offers</Text>
          </View>
        </View>

        {/* Incoming Searches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Incoming Searches ({incomingSearches.length})
            </Text>
            {incomingSearches.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Ionicons name="trash-outline" size={16} color="#F44336" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {incomingSearches.length > 0 ? (
            incomingSearches.map((search) => (
              <TouchableOpacity
                key={search.searchId}
                style={styles.searchCard}
                onPress={() => handleSearchPress(search)}
              >
                <View style={styles.searchHeader}>
                  <Text style={styles.searchProductName}>
                    {search.productName}
                  </Text>
                  <View style={styles.searchBadge}>
                    <Text style={styles.searchBadgeText}>NEW</Text>
                  </View>
                </View>

                <View style={styles.searchDetails}>
                  <View style={styles.searchDetailItem}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.searchDetailText}>
                      {search.distance
                        ? `${search.distance.toFixed(1)} km away`
                        : 'Nearby'}
                    </Text>
                  </View>

                  {search.category && (
                    <View style={styles.searchDetailItem}>
                      <Ionicons
                        name="pricetag-outline"
                        size={16}
                        color="#666"
                      />
                      <Text style={styles.searchDetailText}>
                        {search.category}
                      </Text>
                    </View>
                  )}

                  {search.maxPrice && (
                    <View style={styles.searchDetailItem}>
                      <Ionicons name="cash-outline" size={16} color="#666" />
                      <Text style={styles.searchDetailText}>
                        Max: ${search.maxPrice}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.searchActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSearchPress(search)}
                  >
                    <Ionicons name="create-outline" size={16} color="#2196F3" />
                    <Text style={styles.actionButtonText}>Respond</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.dismissButton]}
                    onPress={() => removeIncomingSearch(search.searchId)}
                  >
                    <Ionicons name="close-outline" size={16} color="#666" />
                    <Text
                      style={[
                        styles.actionButtonText,
                        styles.dismissButtonText,
                      ]}
                    >
                      Dismiss
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Incoming Searches</Text>
              <Text style={styles.emptyStateText}>
                {isConnected
                  ? 'Waiting for customer search requests...'
                  : 'Connect to receive real-time search requests'}
              </Text>
            </View>
          )}
        </View>

        {/* Debug Info (only in development) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>
              Connected: {isConnected ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Incoming Searches: {incomingSearches.length}
            </Text>
            <Text style={styles.debugText}>
              Offer Statuses: {Object.keys(offerStatuses).length}
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 4,
  },
  searchCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  searchBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  searchBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  searchDetails: {
    marginBottom: 12,
  },
  searchDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  searchDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  searchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: '#f5f5f5',
  },
  dismissButtonText: {
    color: '#666',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
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
