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
