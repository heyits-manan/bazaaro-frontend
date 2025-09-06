import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Offer } from '../../types/api';

interface OfferCardProps {
  offer: Offer;
  searchId: string;
  onAccept: (offerId: number) => void;
  onReject: (offerId: number) => void;
  onViewLocation: (offer: Offer) => void;
  canAct: boolean; // whether user can accept/reject
}

export function OfferCard({
  offer,
  searchId,
  onAccept,
  onReject,
  onViewLocation,
  canAct,
}: OfferCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (offer.status) {
      case 'accepted':
        return <CheckCircle size={20} color="#10b981" />;
      case 'rejected':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return <AlertCircle size={20} color="#f59e0b" />;
    }
  };

  const getStatusColor = () => {
    switch (offer.status) {
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = () => {
    switch (offer.status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  useEffect(() => {
    console.log('OFFER CARD: ', offer);
  }, []);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>
            {offer.store?.name || `Store #${offer.storeId}`}
          </Text>
          <View style={styles.rating}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>
              {offer.store?.rating
                ? parseFloat(offer.store.rating).toFixed(1)
                : 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Clock size={14} color="#6b7280" />
        <Text style={styles.time}>{formatTime(offer.createdAt)}</Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>Available Stock: {offer.stock}</Text>
        <Text style={styles.price}>${parseFloat(offer.price).toFixed(2)}</Text>
      </View>

      <Text style={styles.message}>ETA: {offer.eta}</Text>

      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => onViewLocation(offer)}
      >
        <MapPin size={16} color="#6366f1" />
        <Text style={styles.locationText}>
          {offer.store?.description || 'View store location'}
        </Text>
      </TouchableOpacity>

      {canAct && offer.status === 'pending' && (
        <View style={styles.actions}>
          <Button
            title="Reject"
            variant="outline"
            size="small"
            onPress={() => onReject(offer.id)}
            style={styles.rejectButton}
          />
          <Button
            title="Accept"
            size="small"
            onPress={() => onAccept(offer.id)}
            style={styles.acceptButton}
          />
        </View>
      )}

      {offer.status === 'accepted' && (
        <View style={styles.acceptedIndicator}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={styles.acceptedText}>Offer Accepted</Text>
        </View>
      )}

      {offer.status === 'rejected' && (
        <View style={styles.rejectedIndicator}>
          <XCircle size={20} color="#ef4444" />
          <Text style={styles.rejectedText}>Offer Rejected</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6366f1',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
  acceptedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  acceptedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  rejectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#fef3f2',
    borderRadius: 8,
  },
  rejectedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
});
