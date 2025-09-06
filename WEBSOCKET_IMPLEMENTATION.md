# WebSocket Implementation Guide - Bazaaro Frontend

This guide explains the WebSocket implementation for real-time communication in the Bazaaro mobile app.

## Overview

The WebSocket implementation provides real-time communication between customers and store owners, enabling instant updates for:

- New product search requests
- Real-time offers from stores
- Offer status updates (accepted/rejected)
- Search status changes

## Architecture

### Core Components

1. **SocketService** (`services/socket.ts`)

   - Low-level WebSocket connection management
   - Event handling and reconnection logic
   - Type-safe event system

2. **WebSocketContext** (`contexts/WebSocketContext.tsx`)

   - React context for WebSocket state management
   - Real-time data storage and updates
   - Event listener management

3. **Custom Hooks** (`hooks/useWebSocket.ts`, `hooks/useSearchWebSocket.ts`)

   - Specialized hooks for different use cases
   - Customer and store owner specific functionality
   - Notification management

4. **UI Components**
   - `WebSocketStatus` - Connection status indicator
   - `RealtimeNotification` - Toast notifications
   - `SearchWithWebSocket` - Customer search interface
   - `StoreOwnerDashboard` - Store owner interface

## Setup

### 1. Environment Configuration

Add to your `.env` file:

```env
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 2. Provider Setup

Wrap your app with the WebSocket provider:

```tsx
import { WebSocketProvider } from './contexts/WebSocketContext';

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>{/* Your app components */}</WebSocketProvider>
    </AuthProvider>
  );
}
```

## Usage Examples

### Customer Search with Real-time Offers

```tsx
import { useCustomerSearchWebSocket } from '../hooks/useSearchWebSocket';

function SearchScreen() {
  const { activeSearches, searchOffers, addSearch, getOffersForSearch } =
    useCustomerSearchWebSocket();

  // Create a new search
  const createSearch = async (productName: string, location: any) => {
    const search = await apiService.createSearch({
      productName,
      latitude: location.latitude,
      longitude: location.longitude,
    });

    addSearch(search);
  };

  // Get offers for current search
  const offers = getOffersForSearch(currentSearchId);

  return (
    <View>
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </View>
  );
}
```

### Store Owner Dashboard

```tsx
import { useStoreOwnerSearchWebSocket } from '../hooks/useSearchWebSocket';

function StoreDashboard() {
  const { incomingSearches, removeIncomingSearch } =
    useStoreOwnerSearchWebSocket();

  const respondToSearch = async (searchId: string, offerData: any) => {
    await apiService.respondToSearch(searchId, offerData);
    removeIncomingSearch(searchId);
  };

  return (
    <View>
      {incomingSearches.map((search) => (
        <SearchCard
          key={search.searchId}
          search={search}
          onRespond={respondToSearch}
        />
      ))}
    </View>
  );
}
```

### Connection Status Monitoring

```tsx
import { useWebSocketConnection } from '../hooks/useWebSocket';

function ConnectionStatus() {
  const { isConnected, error, reconnect } = useWebSocketConnection();

  return (
    <View>
      <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      {error && <Text>Error: {error}</Text>}
      {!isConnected && <Button title="Reconnect" onPress={reconnect} />}
    </View>
  );
}
```

### Real-time Notifications

```tsx
import { useSearchNotifications } from '../hooks/useSearchWebSocket';

function NotificationHandler() {
  const { notifications, unreadCount, markAsRead } = useSearchNotifications();

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onPress={() => markAsRead(notification.id)}
        />
      ))}
    </View>
  );
}
```

## WebSocket Events

### Customer Events

- `offers:new` - New offer received for a search
- `offer:accepted` - One of your offers was accepted
- `offer:rejected` - One of your offers was rejected
- `search:status_update` - Search status changed

### Store Owner Events

- `search:incoming` - New search request from customer
- `offer:status_update` - Offer status changed

### Connection Events

- `connect` - Successfully connected
- `disconnect` - Connection lost
- `connect_error` - Connection failed
- `reconnect` - Reconnected after disconnection

## Error Handling

The WebSocket implementation includes comprehensive error handling:

1. **Connection Errors**: Automatic reconnection with exponential backoff
2. **Authentication Errors**: Token validation and refresh
3. **Network Errors**: Graceful degradation and user feedback
4. **Event Errors**: Safe event handling with fallbacks

## Performance Considerations

1. **Memory Management**: Automatic cleanup of old data
2. **Event Throttling**: Prevents excessive re-renders
3. **Connection Pooling**: Efficient connection management
4. **Data Pagination**: Limits stored data size

## Testing

### Unit Tests

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useWebSocketConnection } from '../hooks/useWebSocket';

test('should connect to WebSocket', async () => {
  const { result } = renderHook(() => useWebSocketConnection());

  await act(async () => {
    await result.current.connect();
  });

  expect(result.current.isConnected).toBe(true);
});
```

### Integration Tests

```tsx
import { socketService } from '../services/socket';

test('should receive new offer event', async () => {
  const mockCallback = jest.fn();

  socketService.onNewOffer(mockCallback);

  // Simulate server event
  socketService.emit('offers:new', mockOfferData);

  expect(mockCallback).toHaveBeenCalledWith(mockOfferData);
});
```

## Debugging

### Enable Debug Logging

```tsx
import { useWebSocketDebug } from '../hooks/useWebSocket';

function DebugPanel() {
  const { debugInfo, testConnectionStatus } = useWebSocketDebug();

  const testConnection = async () => {
    const isWorking = await testConnectionStatus();
    console.log('Connection test:', isWorking ? 'PASSED' : 'FAILED');
  };

  return (
    <View>
      <Text>Debug Info: {JSON.stringify(debugInfo, null, 2)}</Text>
      <Button title="Test Connection" onPress={testConnection} />
    </View>
  );
}
```

### Common Issues

1. **Connection Fails**: Check token validity and server availability
2. **Events Not Received**: Verify event names match backend
3. **Memory Leaks**: Ensure proper cleanup in useEffect
4. **Reconnection Loops**: Check network stability and server health

## Best Practices

1. **Always Clean Up**: Remove event listeners in useEffect cleanup
2. **Handle Offline State**: Provide fallback UI when disconnected
3. **Optimize Re-renders**: Use useCallback and useMemo appropriately
4. **Error Boundaries**: Wrap WebSocket components in error boundaries
5. **User Feedback**: Show connection status and loading states

## Security Considerations

1. **Token Validation**: Always validate JWT tokens
2. **Event Sanitization**: Sanitize incoming event data
3. **Rate Limiting**: Implement client-side rate limiting
4. **Secure Connections**: Use WSS in production

## Production Deployment

1. **Environment Variables**: Set production WebSocket URL
2. **Monitoring**: Implement connection monitoring
3. **Logging**: Add comprehensive logging
4. **Fallbacks**: Implement offline mode fallbacks

## Troubleshooting

### Connection Issues

```tsx
// Check connection status
const { isConnected, error, reconnect } = useWebSocketConnection();

if (!isConnected) {
  console.log('WebSocket disconnected:', error);
  await reconnect();
}
```

### Event Issues

```tsx
// Verify event listeners
useEffect(() => {
  const handleNewOffer = (data) => {
    console.log('New offer received:', data);
  };

  onNewOffer(handleNewOffer);

  return () => {
    // Cleanup is automatic
  };
}, [onNewOffer]);
```

### Performance Issues

```tsx
// Optimize re-renders
const memoizedOffers = useMemo(
  () => getOffersForSearch(searchId),
  [searchId, searchOffers]
);

const handleOfferPress = useCallback((offer) => {
  // Handle offer press
}, []);
```

## API Reference

### WebSocketService

```tsx
interface WebSocketService {
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  emit(event: string, data?: any): void;
  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void;
  off<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ): void;
  removeAllListeners(): void;
  getState(): WebSocketState;
}
```

### Hooks

- `useWebSocketConnection()` - Connection management
- `useNewOffers()` - Customer offer handling
- `useIncomingSearches()` - Store owner search handling
- `useSearchNotifications()` - Notification management
- `useCustomerSearchWebSocket()` - Complete customer functionality
- `useStoreOwnerSearchWebSocket()` - Complete store owner functionality

## Support

For issues or questions about the WebSocket implementation:

1. Check the debug panel for connection status
2. Review console logs for error messages
3. Verify backend WebSocket server is running
4. Test with the provided example components

## Changelog

### v1.0.0

- Initial WebSocket implementation
- Real-time offer and search functionality
- Comprehensive error handling
- Type-safe event system
- React hooks for easy integration
