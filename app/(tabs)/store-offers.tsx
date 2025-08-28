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
  Store,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { apiService } from '../../services/api';
import { Offer, StoreOffersResponse } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';

export default function StoreOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStoreOffers();
  }, []);

  const loadStoreOffers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getStoreOffers();
      console.log('Store offers response:', response);

      if (response.success && response.data) {
        // The API returns { message: "...", offers: [...] }
        // So response.data.offers contains the array
        const storeOffersResponse = response.data as StoreOffersResponse;

        if (
          storeOffersResponse.offers &&
          Array.isArray(storeOffersResponse.offers)
        ) {
          setOffers(storeOffersResponse.offers);
          console.log('Set store offers:', storeOffersResponse.offers.length);
        } else {
          console.log(
            'Unexpected store offers response structure:',
            storeOffersResponse
          );
          setOffers([]);
        }
      } else {
        console.error('Failed to load store offers:', response.error);
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading store offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStoreOffers();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={20} color="#10b981" />;
      case 'rejected':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <AlertCircle size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
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

  const getOffersByStatus = () => {
    const pending = offers.filter((o) => o.status === 'pending');
    const accepted = offers.filter((o) => o.status === 'accepted');
    const rejected = offers.filter((o) => o.status === 'rejected');
    return { pending, accepted, rejected };
  };

  const { pending, accepted, rejected } = getOffersByStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Store size={32} color="#6366f1" />
          <Text style={styles.title}>Store Offers</Text>
          <Text style={styles.subtitle}>
            Track your offers to customer searches
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <TrendingUp size={24} color="#f59e0b" />
            <Text style={styles.summaryNumber}>{pending.length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <CheckCircle size={24} color="#10b981" />
            <Text style={styles.summaryNumber}>{accepted.length}</Text>
            <Text style={styles.summaryLabel}>Accepted</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <XCircle size={24} color="#ef4444" />
            <Text style={styles.summaryNumber}>{rejected.length}</Text>
            <Text style={styles.summaryLabel}>Rejected</Text>
          </Card>
        </View>

        {loading && (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your offers...</Text>
          </Card>
        )}

        {!loading && offers.length === 0 && (
          <Card style={styles.emptyCard}>
            <Store size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Offers Yet</Text>
            <Text style={styles.emptyText}>
              When you respond to customer searches, your offers will appear
              here.
            </Text>
          </Card>
        )}

        {/* Pending Offers */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Offers</Text>
            {pending.map((offer) => (
              <Card key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <View style={styles.offerInfo}>
                    <Text style={styles.searchId}>
                      Search ID: {offer.searchId}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#6b7280" />
                      <Text style={styles.time}>
                        {formatTime(offer.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(offer.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(offer.status) },
                      ]}
                    >
                      {getStatusText(offer.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.offerDetails}>
                  <View style={styles.priceContainer}>
                    <DollarSign size={16} color="#059669" />
                    <Text style={styles.price}>
                      ${parseFloat(offer.price).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.eta}>ETA: {offer.eta}</Text>
                  <Text style={styles.stock}>Stock: {offer.stock}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Accepted Offers */}
        {accepted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accepted Offers</Text>
            {accepted.map((offer) => (
              <Card
                key={offer.id}
                style={[styles.offerCard, styles.acceptedCard] as any}
              >
                <View style={styles.offerHeader}>
                  <View style={styles.offerInfo}>
                    <Text style={styles.searchId}>
                      Search ID: {offer.searchId}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#6b7280" />
                      <Text style={styles.time}>
                        {formatTime(offer.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(offer.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(offer.status) },
                      ]}
                    >
                      {getStatusText(offer.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.offerDetails}>
                  <View style={styles.priceContainer}>
                    <DollarSign size={16} color="#059669" />
                    <Text style={styles.price}>
                      ${parseFloat(offer.price).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.eta}>ETA: {offer.eta}</Text>
                  <Text style={styles.stock}>Stock: {offer.stock}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Rejected Offers */}
        {rejected.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejected Offers</Text>
            {rejected.map((offer) => (
              <Card
                key={offer.id}
                style={[styles.offerCard, styles.rejectedCard] as any}
              >
                <View style={styles.offerHeader}>
                  <View style={styles.offerInfo}>
                    <Text style={styles.searchId}>
                      Search ID: {offer.searchId}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#6b7280" />
                      <Text style={styles.time}>
                        {formatTime(offer.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(offer.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(offer.status) },
                      ]}
                    >
                      {getStatusText(offer.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.offerDetails}>
                  <View style={styles.priceContainer}>
                    <DollarSign size={16} color="#059669" />
                    <Text style={styles.price}>
                      ${parseFloat(offer.price).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.eta}>ETA: {offer.eta}</Text>
                  <Text style={styles.stock}>Stock: {offer.stock}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  offerCard: {
    marginBottom: 12,
  },
  acceptedCard: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  rejectedCard: {
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: '#fef3f2',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerInfo: {
    flex: 1,
  },
  searchId: {
    fontSize: 16,
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
  offerDetails: {
    gap: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    marginLeft: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  eta: {
    fontSize: 14,
    color: '#6b7280',
  },
  stock: {
    fontSize: 14,
    color: '#6b7280',
  },
});
