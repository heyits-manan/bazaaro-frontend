import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WebSocketEvents,
  WebSocketState,
  WebSocketService,
  NewOfferEvent,
  IncomingSearchEvent,
  OfferStatusEvent,
  SearchStatusEvent,
} from '../types/api';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

class SocketService implements WebSocketService {
  private socket: Socket | null = null;
  private pendingListeners: Array<() => void> = [];
  private state: WebSocketState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  };
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  async connect(): Promise<void> {
    if (this.state.isConnecting || this.state.isConnected) {
      return;
    }

    try {
      this.state.isConnecting = true;
      this.state.error = null;

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();

      // Register any pending listeners
      this.pendingListeners.forEach((fn) => fn());
      this.pendingListeners = [];
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : 'Connection failed';
      this.state.isConnecting = false;
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.state.isConnected = true;
      this.state.isConnecting = false;
      this.state.error = null;
      this.state.lastConnected = new Date();
      this.state.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.state.isConnected = false;
      this.state.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.state.error = error.message;
      this.state.isConnecting = false;
      this.state.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.state.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error);
      this.state.error = error.message;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed after maximum attempts');
      this.state.error = 'Failed to reconnect after maximum attempts';
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.error = null;
    this.pendingListeners = [];
  }

  isConnected(): boolean {
    return this.state.isConnected && this.socket?.connected === true;
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event '${event}': Socket not connected`);
    }
  }

  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    } else {
      this.pendingListeners.push(() => this.on(event, callback));
    }
  }

  off<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event as string, callback as any);
      } else {
        this.socket.removeAllListeners(event as string);
      }
    }
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    this.pendingListeners = [];
  }

  getState(): WebSocketState {
    return { ...this.state };
  }

  // Convenience methods for specific events
  onNewOffer(callback: (data: NewOfferEvent) => void): void {
    this.on('offers:new', callback);
  }

  onIncomingSearch(callback: (data: IncomingSearchEvent) => void): void {
    this.on('search:incoming', callback);
  }

  onOfferAccepted(callback: (data: OfferStatusEvent) => void): void {
    this.on('offer:accepted', callback);
  }

  onOfferRejected(callback: (data: OfferStatusEvent) => void): void {
    this.on('offer:rejected', callback);
  }

  onSearchStatusUpdate(callback: (data: SearchStatusEvent) => void): void {
    this.on('search:status_update', callback);
  }

  onOfferStatusUpdate(callback: (data: OfferStatusEvent) => void): void {
    this.on('offer:status_update', callback);
  }

  // Test connection with ping-pong
  testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConnected()) {
        resolve(false);
        return;
      }

      const testMessage = `test-${Date.now()}`;
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 5000);

      this.socket?.on('pong', (data: { message: string }) => {
        if (data.message === testMessage && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(true);
        }
      });

      this.emit('ping', { message: testMessage });
    });
  }

  // Reconnect manually
  async reconnect(): Promise<void> {
    this.disconnect();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    await this.connect();
  }
}

export const socketService = new SocketService();
