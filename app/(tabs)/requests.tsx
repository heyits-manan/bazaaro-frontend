import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MessageCircle,
  Clock,
  MapPin,
  DollarSign,
  Settings2,
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiService } from '../../services/api';
import * as Location from 'expo-location';
import { Search } from '../../types/api';
import { Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useStoreOwnerSearchWebSocket } from '../../hooks/useSearchWebSocket';
import { useWebSocketConnection } from '../../hooks/useWebSocket';

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Requests() {
  const { user, loading } = useAuth();
  const { isConnected } = useWebSocketConnection();
  const { incomingSearches, removeIncomingSearch } =
    useStoreOwnerSearchWebSocket();

  if (loading) return null;
  if (!user || user.role !== 'shop_owner') {
    return <Redirect href="/(tabs)/search" />;
  }

  const [requests, setRequests] = useState<Search[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [offerData, setOfferData] = useState({
    price: '',
    eta: '',
    stock: '',
  });
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Convert incoming searches to requests format
  useEffect(() => {
    const convertedRequests = incomingSearches.map((searchData) => ({
      id: searchData.searchId,
      userId: 0, // We don't have userId in incoming search data
      productName: searchData.productName,
      latitude: searchData.latitude.toString(),
      longitude: searchData.longitude.toString(),
      status: 'pending' as const,
      selectedOfferId: null,
      createdAt: new Date().toISOString(),
      category: searchData.category,
      maxPrice: searchData.maxPrice,
    }));
    setRequests(convertedRequests);
  }, [incomingSearches]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to find nearby searches'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      loadRequests(location);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const loadRequests = async (currentLocation: Location.LocationObject) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await apiService.getNearbySearches({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        radius: 5, // Fixed radius of 5 km
      });

      if (response.success && response.data?.searches) {
        const formattedSearches = response.data.searches
          .map((search) => ({
            id: search.id,
            userId: search.user_id,
            productName: search.product_name,
            latitude: search.latitude,
            longitude: search.longitude,
            status: search.status,
            selectedOfferId: search.selected_offer_id,
            createdAt: search.created_at,
            category: search.category,
            maxPrice: search.max_price,
          }))
          .filter((search) => search.status === 'pending');
        setRequests(formattedSearches);
      } else {
        console.error('Error loading requests:', response.error);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await loadRequests(location);
    }
    setRefreshing(false);
  };

  const handleRespond = async (requestId: string) => {
    if (!offerData.price || !offerData.eta || !offerData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await apiService.respondToSearchOffer({
        searchId: requestId,
        price: parseFloat(offerData.price),
        eta: offerData.eta,
        stock: parseInt(offerData.stock),
      });

      if (response.success) {
        Alert.alert('Success', 'Your offer has been sent to the customer!');
        setRespondingTo(null);
        setOfferData({ price: '', eta: '', stock: '' });

        // Remove the request from the list
        removeIncomingSearch(requestId);
      } else {
        Alert.alert('Error', response.error || 'Failed to send offer');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          <Text style={styles.title}>Customer Requests</Text>
          <Text style={styles.subtitle}>
            Respond to nearby customer searches within 5 km
          </Text>
          <View style={styles.connectionStatus}>
            <Text
              style={[
                styles.connectionText,
                { color: isConnected ? '#10b981' : '#ef4444' },
              ]}
            >
              {isConnected ? 'Real-time enabled' : 'Offline mode'}
            </Text>
          </View>
        </View>

        {requests.length === 0 && (
          <Card style={styles.emptyCard}>
            <Clock size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptyText}>
              When customers search for products in your area, their requests
              will appear here.
            </Text>
          </Card>
        )}

        {requests.map((request) => {
          const distance = location
            ? calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                parseFloat(request.latitude),
                parseFloat(request.longitude)
              )
            : 0;

          return (
            <Card key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <Text style={styles.productName}>
                    Looking for: {request.productName}
                  </Text>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.time}>
                      {formatTime(request.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.distanceContainer}>
                  <MapPin size={14} color="#6366f1" />
                  <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
                </View>
              </View>

              <View style={styles.searchDetails}>
                {request.category && (
                  <Text style={styles.category}>
                    Category: {request.category}
                  </Text>
                )}
                {request.maxPrice && (
                  <View style={styles.priceContainer}>
                    <DollarSign size={16} color="#059669" />
                    <Text style={styles.maxPrice}>
                      Max Budget: ${request.maxPrice}
                    </Text>
                  </View>
                )}
              </View>

              {respondingTo === request.id ? (
                <View style={styles.responseForm}>
                  <Input
                    label="Price ($)"
                    value={offerData.price}
                    onChangeText={(text) =>
                      setOfferData((prev) => ({ ...prev, price: text }))
                    }
                    placeholder="Enter your price"
                    keyboardType="numeric"
                  />
                  <Input
                    label="Estimated Time (e.g., 2 hours)"
                    value={offerData.eta}
                    onChangeText={(text) =>
                      setOfferData((prev) => ({ ...prev, eta: text }))
                    }
                    placeholder="Enter estimated delivery time"
                  />
                  <Input
                    label="Available Stock"
                    value={offerData.stock}
                    onChangeText={(text) =>
                      setOfferData((prev) => ({ ...prev, stock: text }))
                    }
                    placeholder="Enter available quantity"
                    keyboardType="numeric"
                  />
                  <View style={styles.responseButtons}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => {
                        setRespondingTo(null);
                        setOfferData({ price: '', eta: '', stock: '' });
                      }}
                    />
                    <Button
                      title="Send Offer"
                      onPress={() => handleRespond(request.id)}
                    />
                  </View>
                </View>
              ) : (
                <Button
                  title="Respond to Request"
                  onPress={() => setRespondingTo(request.id)}
                />
              )}
            </Card>
          );
        })}
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
  requestCard: {
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distance: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
  },
  searchDetails: {
    marginBottom: 16,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxPrice: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  responseForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
