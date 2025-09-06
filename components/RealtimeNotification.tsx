import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSearchNotifications } from '../hooks/useSearchWebSocket';
import { Ionicons } from '@expo/vector-icons';
import {
  NewOfferEvent,
  IncomingSearchEvent,
  OfferStatusEvent,
} from '../types/api';

interface RealtimeNotificationProps {
  onPress?: (notification: any) => void;
  autoHide?: boolean;
  hideDelay?: number;
}

export function RealtimeNotification({
  onPress,
  autoHide = true,
  hideDelay = 5000,
}: RealtimeNotificationProps) {
  const { notifications, unreadCount, markAsRead } = useSearchNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<any[]>([]);
  const [animations] = useState(new Map<string, Animated.Value>());

  // Get the latest unread notification
  const latestNotification = notifications.find((n) => !n.read);

  useEffect(() => {
    if (latestNotification) {
      const notificationId = latestNotification.id;

      // Create animation for new notification
      if (!animations.has(notificationId)) {
        animations.set(notificationId, new Animated.Value(0));
      }

      const animation = animations.get(notificationId)!;

      // Show notification
      setVisibleNotifications((prev) => [
        latestNotification,
        ...prev.slice(0, 2),
      ]);

      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after delay
      if (autoHide) {
        const timer = setTimeout(() => {
          hideNotification(notificationId);
        }, hideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [latestNotification, autoHide, hideDelay]);

  const hideNotification = (notificationId: string) => {
    const animation = animations.get(notificationId);
    if (animation) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisibleNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        animations.delete(notificationId);
      });
    }
  };

  const handlePress = (notification: any) => {
    markAsRead(notification.id);
    hideNotification(notification.id);
    onPress?.(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_offer':
        return 'gift';
      case 'incoming_search':
        return 'search';
      case 'offer_accepted':
        return 'checkmark-circle';
      case 'offer_rejected':
        return 'close-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_offer':
        return '#4CAF50';
      case 'incoming_search':
        return '#2196F3';
      case 'offer_accepted':
        return '#4CAF50';
      case 'offer_rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_offer':
        return 'New Offer!';
      case 'incoming_search':
        return 'New Search Request';
      case 'offer_accepted':
        return 'Offer Accepted';
      case 'offer_rejected':
        return 'Offer Rejected';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (notification: any) => {
    const { type, data } = notification;

    switch (type) {
      case 'new_offer':
        return `New offer for ${data.offer?.store?.name || 'a store'}`;
      case 'incoming_search':
        return `Search for "${data.productName}" nearby`;
      case 'offer_accepted':
        return `Your offer was accepted`;
      case 'offer_rejected':
        return `Your offer was rejected`;
      default:
        return 'You have a new notification';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleNotifications.map((notification) => {
        const animation = animations.get(notification.id);
        if (!animation) return null;

        return (
          <Animated.View
            key={notification.id}
            style={[
              styles.notification,
              {
                opacity: animation,
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.notificationContent}
              onPress={() => handlePress(notification)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  {getNotificationTitle(notification.type)}
                </Text>
                <Text style={styles.message}>
                  {getNotificationMessage(notification)}
                </Text>
                <Text style={styles.timestamp}>
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => hideNotification(notification.id)}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  closeButton: {
    padding: 4,
  },
});
