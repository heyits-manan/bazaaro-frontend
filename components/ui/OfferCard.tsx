import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Star, Clock } from 'lucide-react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Offer } from '../../types/api';

interface OfferCardProps {
  offer: Offer;
  onAccept: (offer: Offer) => void;
  onReject: (offer: Offer) => void;
  onViewLocation: (offer: Offer) => void;
}

export function OfferCard({
  offer,
  onAccept,
  onReject,
  onViewLocation,
}: OfferCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    console.log('OFFER CARD: ', offer);
  }, []);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{offer.store.name}</Text>
          <View style={styles.rating}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>
              {parseFloat(offer.store.rating).toFixed(1)}
            </Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.time}>{formatTime(offer.createdAt)}</Text>
        </View>
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
        <Text style={styles.locationText}>{offer.store.description}</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <Button
          title="Reject"
          variant="outline"
          size="small"
          onPress={() => onReject(offer)}
          style={styles.rejectButton}
        />
        <Button
          title="Accept"
          size="small"
          onPress={() => onAccept(offer)}
          style={styles.acceptButton}
        />
      </View>
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
