# Offer Acceptance/Rejection Implementation

This document outlines the implementation of offer acceptance and rejection functionality in the Expo frontend application.

## Overview

The implementation provides a complete workflow for users to accept or reject offers from stores, with real-time updates and comprehensive status tracking.

## Features Implemented

### 1. API Service Updates

- **New Endpoints Added:**
  - `PUT /api/search/:searchId/offers/:offerId/accept` - Accept an offer
  - `PUT /api/search/:searchId/offers/:offerId/reject` - Reject an offer
  - `GET /api/search/user/searches` - Get user's search history
  - `GET /api/search/user/offers` - Get user's offers across all searches
  - `GET /api/store/offers` - Get store's offers (for shop owners)

### 2. Enhanced OfferCard Component

- **Status Indicators:**
  - Pending: Yellow/orange with alert icon
  - Accepted: Green with checkmark icon
  - Rejected: Red with X icon
- **Conditional Action Buttons:**
  - Accept/Reject buttons only show for pending offers
  - Disabled for accepted/rejected offers
- **Visual Status Display:**
  - Clear status text and colors
  - Status-specific background styling

### 3. New Tabs and Views

#### My Searches Tab (for users)

- View search history with status tracking
- Navigate to offers for each search
- Cancel pending searches (placeholder for future backend endpoint)
- Search completion status display

#### Store Offers Tab (for shop owners)

- Track all offers made to customer searches
- Summary cards showing counts by status
- Organized sections for pending, accepted, and rejected offers
- Visual status indicators and styling

### 4. Enhanced Offers Tab

- Real-time offer status updates
- Proper offer acceptance/rejection handling
- Status-based offer filtering and display
- Integration with new API endpoints

### 5. Search Tab Enhancements

- Current search status display
- Offer count summary
- Quick navigation to offers
- Real-time search progress tracking

### 6. Real-time Updates

- WebSocket integration for instant status updates
- Offer status change notifications
- Search status change notifications
- Automatic UI updates without refresh

## Technical Implementation

### State Management

- Local state for offers, searches, and loading states
- Real-time updates via WebSocket listeners
- Optimistic updates for better UX

### Error Handling

- Comprehensive error handling for API calls
- User-friendly error messages
- Graceful fallbacks for network issues

### UI/UX Features

- Loading states and spinners
- Pull-to-refresh functionality
- Empty state handling
- Responsive design with proper spacing

## File Structure

```
app/(tabs)/
├── offers.tsx              # Enhanced offers view with status handling
├── my-searches.tsx         # New tab for user search history
├── store-offers.tsx        # New tab for shop owner offer tracking
├── search.tsx              # Enhanced with current search status
└── _layout.tsx             # Updated with new tabs

components/ui/
└── OfferCard.tsx           # Enhanced with status indicators and conditional actions

services/
├── api.ts                  # New API endpoints for offer management
└── socket.ts               # Enhanced with status update listeners

types/
└── api.ts                  # Existing types (already had required status types)
```

## API Integration

### Backend Requirements

The implementation expects the following backend endpoints to be available:

1. **Accept Offer**: `PUT /api/search/:searchId/offers/:offerId/accept`
2. **Reject Offer**: `PUT /api/search/:searchId/offers/:offerId/reject`
3. **Get User Searches**: `GET /api/search/user/searches`
4. **Get User Offers**: `GET /api/search/user/offers`
5. **Get Store Offers**: `GET /api/store/offers`

### Authentication

All API calls include proper authorization headers using the stored JWT token.

## Real-time Features

### WebSocket Events

- `offer_status_update` - When offer status changes
- `search_status_update` - When search status changes
- `new_offer` - When new offers are received

### Automatic Updates

- UI updates immediately when status changes
- No manual refresh required
- Consistent state across all tabs

## User Experience Features

### For Customers (Users)

- Clear offer status visibility
- Easy acceptance/rejection workflow
- Search history tracking
- Real-time offer notifications

### For Shop Owners

- Comprehensive offer tracking
- Status-based organization
- Performance metrics (counts by status)
- Easy navigation between different offer states

## Testing Scenarios

### Core Functionality

1. **Accept Offer**: Verify status changes to "accepted"
2. **Reject Offer**: Verify status changes to "rejected"
3. **Multiple Offers**: Verify only one can be accepted
4. **Completed Searches**: Verify no more actions can be taken

### Real-time Updates

1. **Status Changes**: Verify UI updates immediately
2. **New Offers**: Verify appear in real-time
3. **Search Updates**: Verify status changes propagate

### Error Handling

1. **Network Errors**: Verify proper error messages
2. **API Failures**: Verify graceful degradation
3. **Invalid States**: Verify proper validation

## Future Enhancements

### Planned Features

- Push notifications for status changes
- Offline support with sync when online
- Offer comparison view (side-by-side)
- Advanced filtering and sorting options
- Analytics dashboard for shop owners

### Backend Integration

- Cancel search endpoint implementation
- Bulk offer management
- Advanced search queries
- Performance optimization

## Configuration

### Environment Variables

Ensure the following are set in your `.env` file:

```
EXPO_PUBLIC_API_URL=your_backend_api_url
EXPO_PUBLIC_SOCKET_URL=your_websocket_url
```

### Dependencies

The implementation uses existing dependencies:

- `@react-native-async-storage/async-storage` - Token storage
- `expo-router` - Navigation
- `lucide-react-native` - Icons
- `socket.io-client` - WebSocket communication

## Troubleshooting

### Common Issues

1. **Offers not updating**: Check WebSocket connection
2. **API calls failing**: Verify authentication token
3. **Status not syncing**: Check real-time listeners
4. **Navigation issues**: Verify tab configuration

### Debug Information

- Console logs for API calls and responses
- WebSocket connection status
- State change tracking
- Error boundary information

## Conclusion

This implementation provides a robust, user-friendly system for managing offer acceptance and rejection with real-time updates. The modular design allows for easy maintenance and future enhancements while providing a seamless user experience for both customers and shop owners.

For questions or issues, refer to the console logs and ensure all backend endpoints are properly implemented and accessible.
