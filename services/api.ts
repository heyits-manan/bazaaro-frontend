import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  User,
  Store,
  Product,
  SearchRequest,
  Search,
  SearchResponse,
  Offer,
  ApiResponse,
  NearbySearchesResponse,
  UserSearchesResponse,
  UserOffersResponse,
  StoreOffersResponse,
  StoreDetails,
} from '../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

class ApiService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      if (!API_URL) {
        console.error(
          'API_URL is not defined. Please check your environment variables.'
        );
        return { success: false, error: 'API URL not configured' };
      }

      const headers = await this.getAuthHeaders();
      const fullUrl = `${API_URL}${endpoint}`;
      console.log('Making request to:', fullUrl);

      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        return {
          success: false,
          error:
            'Server returned invalid JSON response. Please check the API endpoint.',
        };
      }

      if (!response.ok) {
        return { success: false, error: data.message || 'Request failed' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Network error details:', error);
      if (
        error instanceof TypeError &&
        error.message === 'Network request failed'
      ) {
        return {
          success: false,
          error: `Network request failed. Please check if the API server is running at ${API_URL}`,
        };
      }
      return { success: false, error: 'Network error' };
    }
  }

  // Authentication
  async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerShopOwner(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register/shop-owner', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  // Store Management
  async createStore(storeData: {
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
  }): Promise<ApiResponse<Store>> {
    return this.request<Store>('/store', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async addProduct(productData: {
    name: string;
    category: string;
    price: number;
    description?: string;
    store_id: string;
  }): Promise<ApiResponse<Product>> {
    return this.request<Product>('/store/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getStoreDetails(): Promise<ApiResponse<StoreDetails>> {
    return this.request<StoreDetails>('/store/details');
  }

  // Search System
  async createSearch(
    searchData: SearchRequest
  ): Promise<ApiResponse<SearchResponse>> {
    // Transform the data to match API expectations
    const apiData = {
      productName: searchData.product_name,
      latitude: searchData.latitude,
      longitude: searchData.longitude,
      ...(searchData.category && { category: searchData.category }),
      ...(searchData.max_price && { maxPrice: searchData.max_price }),
      ...(searchData.radius && { radius: searchData.radius }),
    };

    return this.request<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async getOffers(searchId: string): Promise<ApiResponse<Offer[]>> {
    return this.request<Offer[]>(`/search/${searchId}/offers`);
  }

  async selectOffer(
    searchId: string,
    offerId: number | string
  ): Promise<ApiResponse<any>> {
    return this.request(`/search/${searchId}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId }),
    });
  }

  async respondToSearch(responseData: {
    search_id: string;
    product_id: string;
    price: number;
    message?: string;
  }): Promise<ApiResponse<Offer>> {
    return this.request<Offer>('/search/respond', {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  async getNearbySearches(params: {
    latitude: number;
    longitude: number;
    radius: number;
  }): Promise<ApiResponse<NearbySearchesResponse>> {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      radius: params.radius.toString(),
    });

    return this.request<NearbySearchesResponse>(
      `/search/nearby?${queryParams.toString()}`
    );
  }

  async respondToSearchOffer(data: {
    searchId: string;
    price: number;
    eta: string;
    stock: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/search/respond', {
      method: 'POST',
      body: JSON.stringify({
        searchId: data.searchId,
        price: data.price,
        eta: data.eta,
        stock: data.stock,
      }),
    });
  }

  // New offer management functions
  async acceptOffer(
    searchId: string,
    offerId: number
  ): Promise<ApiResponse<any>> {
    return this.request(`/search/${searchId}/offers/${offerId}/accept`, {
      method: 'PUT',
    });
  }

  async rejectOffer(
    searchId: string,
    offerId: number
  ): Promise<ApiResponse<any>> {
    return this.request(`/search/${searchId}/offers/${offerId}/reject`, {
      method: 'PUT',
    });
  }

  async getUserSearches(): Promise<ApiResponse<UserSearchesResponse>> {
    return this.request<UserSearchesResponse>('/search/user/searches');
  }

  async getUserOffers(): Promise<ApiResponse<UserOffersResponse>> {
    return this.request<UserOffersResponse>('/search/user/offers');
  }

  async getStoreOffers(): Promise<ApiResponse<StoreOffersResponse>> {
    return this.request<StoreOffersResponse>('/store/offers');
  }
}

export const apiService = new ApiService();
