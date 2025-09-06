import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebSocketConnection } from '../hooks/useWebSocket';
import { Ionicons } from '@expo/vector-icons';

interface WebSocketStatusProps {
  showDetails?: boolean;
  onReconnect?: () => void;
}

export function WebSocketStatus({
  showDetails = false,
  onReconnect,
}: WebSocketStatusProps) {
  const { isConnected, isConnecting, error, reconnect } =
    useWebSocketConnection();

  const handleReconnect = async () => {
    try {
      await reconnect();
      onReconnect?.();
    } catch (error) {
      console.error('Reconnect failed:', error);
    }
  };

  const getStatusColor = () => {
    if (isConnected) return '#4CAF50';
    if (isConnecting) return '#FF9800';
    if (error) return '#F44336';
    return '#9E9E9E';
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    if (error) return 'Disconnected';
    return 'Offline';
  };

  const getStatusIcon = () => {
    if (isConnected) return 'checkmark-circle';
    if (isConnecting) return 'refresh-circle';
    if (error) return 'close-circle';
    return 'ellipse-outline';
  };

  if (!showDetails && isConnected) {
    return null; // Don't show anything when connected and not showing details
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}
      >
        <Ionicons name={getStatusIcon() as any} size={16} color="white" />
      </View>

      <Text style={styles.statusText}>{getStatusText()}</Text>

      {showDetails && (
        <View style={styles.details}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {!isConnected && !isConnecting && (
            <TouchableOpacity
              style={styles.reconnectButton}
              onPress={handleReconnect}
            >
              <Ionicons name="refresh" size={16} color="#2196F3" />
              <Text style={styles.reconnectText}>Reconnect</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  details: {
    flex: 1,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 4,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  reconnectText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
});
