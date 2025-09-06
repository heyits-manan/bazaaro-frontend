import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { MessageCircle, Clock, MapPin } from 'lucide-react-native';
import { OfferCard } from '../../components/ui/OfferCard';
import { Card } from '../../components/ui/Card';
import { apiService } from '../../services/api';
import { Offer } from '../../types/api';
import { useSearch } from '../../contexts/SearchContext';
import { useCustomerSearchWebSocket } from '../../hooks/useSearchWebSocket';
import { useWebSocketConnection } from '../../hooks/useWebSocket';

export default function Offers() {
  const { searchId: paramSearchId } = useLocalSearchParams<{
    searchId?: string;
  }>();
  const { activeSearchId, setActiveSearchId } = useSearch();
  const { isConnected } = useWebSocketConnection();
  const { getOffersForSearch, getActiveSearch, addSearch } =
    useCustomerSearchWebSocket();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use either the param search ID or the active search ID
  const searchId = paramSearchId || activeSearchId;

  // Get offers from WebSocket hook
  const offers = searchId ? getOffersForSearch(searchId) : [];
  const currentSearch = searchId ? getActiveSearch(searchId) : null;

  useEffect(() => {
    console.log('Search ID from params:', paramSearchId);
    console.log('Active search ID:', activeSearchId);
    console.log('Using search ID:', searchId);

    // If we have a param search ID, update the active search ID
    if (paramSearchId) {
      console.log('Updating active search ID with param:', paramSearchId);
      setActiveSearchId(paramSearchId).catch((error) => {
        console.error('Error updating active search ID:', error);
      });
    }
  }, [paramSearchId, activeSearchId]);

  useEffect(() => {
    if (searchId) {
      console.log('Loading offers for search ID:', searchId);
      loadOffers();

      // Add search to WebSocket tracking if not already tracked
      if (!currentSearch) {
        // Create a basic search object for WebSocket tracking
        const searchData = {
          id: searchId,
          userId: 1, // This should come from auth context
          productName: 'Search in progress',
          latitude: '0',
          longitude: '0',
          status: 'pending' as const,
          selectedOfferId: null,
          createdAt: new Date().toISOString(),
        };
        addSearch(searchData);
      }
    } else {
      console.log('No search ID available, skipping offer loading');
    }
  }, [searchId, currentSearch, addSearch]);

  const loadOffers = async () => {
    if (!searchId) {
      console.log('No search ID available for loading offers');
      return;
    }

    setLoading(true);
    try {
      console.log('Loading offers for search ID:', searchId);
      const response = await apiService.getOffers(searchId);
      console.log('Offers response:', response);
      if (response.success && response.data) {
        console.log('Offers loaded from API:', response.data);
        // The offers will be automatically managed by the WebSocket hook
        // We just need to trigger the API call to get initial data
      } else {
        console.error('Failed to load offers:', response.error);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOffers();
    console.log('Current offers after refresh:', offers);
    setRefreshing(false);
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (!searchId) return;

    try {
      const response = await apiService.acceptOffer(searchId, offerId);
      if (response.success) {
        Alert.alert(
          'Offer Accepted!',
          `Your offer has been accepted. You can now view the store location.`,
          [
            { text: 'OK' },
            {
              text: 'View Location',
              onPress: () => {
                const acceptedOffer = offers.find((o) => o.id === offerId);
                if (acceptedOffer) handleViewLocation(acceptedOffer);
              },
            },
          ]
        );

        // The WebSocket hook will automatically update the offer status
        // No need to manually update state
      } else {
        Alert.alert('Error', response.error || 'Failed to accept offer');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleRejectOffer = async (offerId: number) => {
    if (!searchId) return;

    try {
      const response = await apiService.rejectOffer(searchId, offerId);
      if (response.success) {
        // The WebSocket hook will automatically update the offer status
        // No need to manually update state
      } else {
        Alert.alert('Error', response.error || 'Failed to reject offer');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleViewLocation = (offer: Offer) => {
    if (offer.store?.latitude && offer.store?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${offer.store.latitude},${offer.store.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert(
        'Location Unavailable',
        'Store location information is not available for this offer.'
      );
    }
  };

  const pendingOffers = offers.filter((offer) => offer.status === 'pending');
  const acceptedOffer = offers.find((offer) => offer.status === 'accepted');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <MessageCircle size={32} color="#6366f1" />
          <Text style={styles.title}>Offers</Text>
          <Text style={styles.subtitle}>
            {searchId
              ? 'Real-time offers from nearby stores'
              : 'Your search offers will appear here'}
          </Text>
          {searchId && (
            <View style={styles.connectionStatus}>
              <Text
                style={[
                  styles.connectionText,
                  { color: isConnected ? '#10b981' : '#ef4444' },
                ]}
              >
                {isConnected ? 'Live updates enabled' : 'Offline mode'}
              </Text>
            </View>
          )}
        </View>

        {!searchId && (
          <Card style={styles.emptyCard}>
            <Clock size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Active Search</Text>
            <Text style={styles.emptyText}>
              Start a new search to receive offers from nearby stores in
              real-time.
            </Text>
          </Card>
        )}

        {searchId && acceptedOffer && (
          <Card style={styles.acceptedCard}>
            <Text style={styles.acceptedTitle}>✅ Offer Accepted!</Text>
            <Text style={styles.acceptedStore}>
              {acceptedOffer.store?.name || `Store #${acceptedOffer.storeId}`}
            </Text>
            <Text style={styles.acceptedProduct}>
              Stock: {acceptedOffer.stock} - $
              {parseFloat(acceptedOffer.price).toFixed(2)}
            </Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#059669" />
              <Text style={styles.locationText}>
                {acceptedOffer.store?.description || 'View store location'}
              </Text>
            </View>
          </Card>
        )}

        {searchId &&
          pendingOffers.length === 0 &&
          !acceptedOffer &&
          !loading && (
            <Card style={styles.waitingCard}>
              <Clock size={48} color="#6366f1" />
              <Text style={styles.waitingTitle}>Waiting for Offers</Text>
              <Text style={styles.waitingText}>
                We've notified nearby stores about your search. Offers will
                appear here as they come in.
              </Text>
            </Card>
          )}

        {pendingOffers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            searchId={searchId!}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            onViewLocation={handleViewLocation}
            canAct={true}
          />
        ))}

        {/* Show rejected offers */}
        {offers
          .filter((offer) => offer.status === 'rejected')
          .map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              searchId={searchId!}
              onAccept={handleAcceptOffer}
              onReject={handleRejectOffer}
              onViewLocation={handleViewLocation}
              canAct={false}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    alignSelf: 'center',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  waitingCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  waitingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369a1',
    marginTop: 16,
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    lineHeight: 20,
  },
  acceptedCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
    padding: 20,
    marginBottom: 16,
  },
  acceptedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  acceptedStore: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  acceptedProduct: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#059669',
    flex: 1,
  },
});
