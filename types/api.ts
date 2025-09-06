export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'shop_owner';
  phone?: string;
  avatar?: string;
}

export interface Store {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  rating: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  store_id: string;
  in_stock: boolean;
}

export interface Search {
  id: string;
  userId: number;
  productName: string;
  latitude: string;
  longitude: string;
  status: 'pending' | 'completed' | 'cancelled';
  selectedOfferId: string | null;
  createdAt: string;
  category?: string;
  maxPrice?: number;
  offers?: Offer[];
}

export interface SearchResponse {
  message: string;
  search: Search;
}

export interface SearchRequest {
  product_name: string;
  category?: string;
  max_price?: number;
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface Offer {
  id: number;
  searchId: string;
  storeId: number;
  price: string;
  eta: string;
  stock: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  store: Store;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface NearbySearchesResponse {
  searches: Array<{
    id: string;
    user_id: number;
    product_name: string;
    latitude: string;
    longitude: string;
    status: 'pending' | 'completed' | 'cancelled';
    selected_offer_id: string | null;
    created_at: string;
    distance: number;
    category?: string;
    max_price?: number;
  }>;
}

export interface OffersResponse {
  offers: Offer[];
  search: Search;
}

export interface UserSearchesResponse {
  message: string;
  searches: Search[];
}

export interface UserOffersResponse {
  message: string;
  offers: Offer[];
}

export interface StoreOffersResponse {
  message: string;
  offers: Offer[];
}

export interface StoreDetails {
  message: string;
  store: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    rating: string;
    isActive: boolean;
    createdAt: string;
    statistics: {
      totalProducts: number;
      activeProducts: number;
      totalOffers: string;
      acceptedOffers: string;
      acceptanceRate: string;
    };
    products: Product[];
  };
}

// WebSocket Event Types
export interface WebSocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;

  // Customer events
  'offers:new': (data: NewOfferEvent) => void;
  'offer:accepted': (data: OfferStatusEvent) => void;
  'offer:rejected': (data: OfferStatusEvent) => void;
  'search:status_update': (data: SearchStatusEvent) => void;

  // Store owner events
  'search:incoming': (data: IncomingSearchEvent) => void;
  'offer:status_update': (data: OfferStatusEvent) => void;

  // General events
  ping: (data: { message: string }) => void;
  pong: (data: { message: string }) => void;
}

// WebSocket Event Data Interfaces
export interface NewOfferEvent {
  searchId: string;
  offer: Offer;
}

export interface IncomingSearchEvent {
  searchId: string;
  productName: string;
  latitude: number;
  longitude: number;
  category?: string;
  maxPrice?: number;
  distance?: number;
}

export interface OfferStatusEvent {
  offerId: number;
  searchId: string;
  status: 'accepted' | 'rejected';
  storeId?: number;
}

export interface SearchStatusEvent {
  searchId: string;
  status: 'completed' | 'cancelled';
  selectedOfferId?: string;
}

// WebSocket Connection State
export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

// WebSocket Service Interface
export interface WebSocketService {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: () => boolean;
  emit: (event: string, data?: any) => void;
  on: <K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ) => void;
  off: <K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ) => void;
  removeAllListeners: () => void;
  getState: () => WebSocketState;
}
