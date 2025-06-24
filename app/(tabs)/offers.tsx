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
import { socketService } from '../../services/socket';
import { Offer } from '../../types/api';
import { useSearch } from '../../contexts/SearchContext';

export default function Offers() {
  const { searchId: paramSearchId } = useLocalSearchParams<{
    searchId?: string;
  }>();
  const { activeSearchId, setActiveSearchId } = useSearch();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use either the param search ID or the active search ID
  const searchId = paramSearchId || activeSearchId;

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

      setupRealTimeListeners();
    } else {
      console.log('No search ID available, skipping offer loading');
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [searchId]);

  const setupRealTimeListeners = () => {
    if (!searchId) {
      console.log('No search ID available for real-time listeners');
      return;
    }
    console.log('Setting up real-time listeners for search ID:', searchId);
    socketService.onNewOffer((offerData) => {
      console.log('Received new offer:', offerData);
      if (offerData.search_id === searchId) {
        setOffers((prev) => [...prev, offerData]);
      }
    });
  };

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
        console.log('Setting offers:', response.data);
        setOffers((response.data as any)?.offers || response.data || []);
      } else {
        console.error('Failed to load offers:', response.error);
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      setOffers([]);
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

  const handleAcceptOffer = async (offer: Offer) => {
    if (!searchId) return;

    try {
      const response = await apiService.selectOffer(
        searchId,
        offer.id.toString()
      );
      if (response.success) {
        Alert.alert(
          'Offer Accepted!',
          `Your offer from ${offer.store.name} has been accepted. You can now view the store location.`,
          [
            { text: 'OK' },
            { text: 'View Location', onPress: () => handleViewLocation(offer) },
          ]
        );

        // Remove other offers and mark this one as accepted
        setOffers((prev) =>
          prev.map((o) =>
            o.id === offer.id
              ? { ...o, status: 'accepted' }
              : { ...o, status: 'rejected' }
          )
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to accept offer');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleRejectOffer = (offer: Offer) => {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
  };

  const handleViewLocation = (offer: Offer) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${offer.store.latitude},${offer.store.longitude}`;
    Linking.openURL(url);
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
            <Text style={styles.acceptedStore}>{acceptedOffer.store.name}</Text>
            <Text style={styles.acceptedProduct}>
              Stock: {acceptedOffer.stock} - $
              {parseFloat(acceptedOffer.price).toFixed(2)}
            </Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#059669" />
              <Text style={styles.locationText}>
                {acceptedOffer.store.description}
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
            onAccept={() => handleAcceptOffer(offer)}
            onReject={() => handleRejectOffer(offer)}
            onViewLocation={() => handleViewLocation(offer)}
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
