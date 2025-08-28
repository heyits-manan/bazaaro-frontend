import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  History,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/api';
import { Search, Offer } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function MySearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserSearches();
  }, []);

  const loadUserSearches = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserSearches();
      console.log('User searches response:', response);

      if (response.success && response.data) {
        // The API returns { message: "...", searches: [...] }
        // So response.data.searches contains the array
        const searches = response.data.searches;

        if (searches && Array.isArray(searches)) {
          setSearches(searches);
          console.log('Set searches:', searches.length);
        } else {
          console.log('Unexpected search response structure:', response.data);
          setSearches([]);
        }
      } else {
        console.error('Failed to load searches:', response.error);
        setSearches([]);
      }
    } catch (error) {
      console.error('Error loading searches:', error);
      setSearches([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserSearches();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#10b981" />;
      case 'cancelled':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <AlertCircle size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const handleViewOffers = (searchId: string) => {
    router.push(`/(tabs)/offers?searchId=${searchId}`);
  };

  const handleCancelSearch = async (searchId: string) => {
    Alert.alert(
      'Cancel Search',
      'Are you sure you want to cancel this search? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: You'll need to add a cancel search endpoint to your API
              // const response = await apiService.cancelSearch(searchId);
              // if (response.success) {
              //   setSearches(prev => prev.map(s =>
              //     s.id === searchId ? { ...s, status: 'cancelled' } : s
              //   ));
              // }
              Alert.alert(
                'Info',
                'Cancel search functionality will be implemented when the backend endpoint is available.'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel search');
            }
          },
        },
      ]
    );
  };

  const getSearchSummary = (search: Search) => {
    if (search.status === 'completed') {
      return `Offer selected: ${search.selectedOfferId ? 'Yes' : 'No'}`;
    } else if (search.status === 'pending') {
      return 'Waiting for offers...';
    } else {
      return 'Search cancelled';
    }
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
          <History size={32} color="#6366f1" />
          <Text style={styles.title}>My Searches</Text>
          <Text style={styles.subtitle}>
            View and manage your product searches
          </Text>
        </View>

        {loading && (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your searches...</Text>
          </Card>
        )}

        {!loading && searches.length === 0 && (
          <Card style={styles.emptyCard}>
            <History size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Searches Yet</Text>
            <Text style={styles.emptyText}>
              Start searching for products to see your search history here.
            </Text>
            <Button
              title="Start Searching"
              onPress={() => router.push('/(tabs)/search')}
              style={styles.startSearchButton}
            />
          </Card>
        )}

        {searches.map((search) => (
          <Card key={search.id} style={styles.searchCard}>
            <View style={styles.searchHeader}>
              <View style={styles.searchInfo}>
                <Text style={styles.productName}>{search.productName}</Text>
                <View style={styles.timeContainer}>
                  <Clock size={14} color="#6b7280" />
                  <Text style={styles.time}>
                    {formatTime(search.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.statusContainer}>
                {getStatusIcon(search.status)}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(search.status) },
                  ]}
                >
                  {getStatusText(search.status)}
                </Text>
              </View>
            </View>

            <View style={styles.searchDetails}>
              {search.category && (
                <Text style={styles.category}>Category: {search.category}</Text>
              )}
              {search.maxPrice && (
                <View style={styles.priceContainer}>
                  <DollarSign size={16} color="#059669" />
                  <Text style={styles.maxPrice}>
                    Max Budget: ${search.maxPrice}
                  </Text>
                </View>
              )}
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#6366f1" />
                <Text style={styles.locationText}>
                  {search.latitude}, {search.longitude}
                </Text>
              </View>
            </View>

            <View style={styles.searchSummary}>
              <Text style={styles.summaryText}>{getSearchSummary(search)}</Text>
            </View>

            <View style={styles.actions}>
              {search.status === 'pending' && (
                <Button
                  title="View Offers"
                  onPress={() => handleViewOffers(search.id)}
                  style={styles.viewOffersButton}
                />
              )}
              {search.status === 'pending' && (
                <Button
                  title="Cancel Search"
                  variant="outline"
                  onPress={() => handleCancelSearch(search.id)}
                  style={styles.cancelButton}
                />
              )}
              {search.status === 'completed' && (
                <Button
                  title="View Details"
                  onPress={() => handleViewOffers(search.id)}
                  style={styles.viewDetailsButton}
                />
              )}
            </View>
          </Card>
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
  loadingCard: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
    marginBottom: 20,
  },
  startSearchButton: {
    minWidth: 150,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  searchInfo: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  maxPrice: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6366f1',
    flex: 1,
  },
  searchSummary: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewOffersButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  viewDetailsButton: {
    flex: 1,
  },
});
