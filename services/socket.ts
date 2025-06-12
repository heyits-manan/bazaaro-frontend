import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;

  async connect() {
    const token = await AsyncStorage.getItem('token');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Listen for new search notifications (for shop owners)
  onNewSearch(callback: (searchData: any) => void) {
    if (this.socket) {
      this.socket.on('new_search', callback);
    }
  }

  // Listen for new offers (for users)
  onNewOffer(callback: (offerData: any) => void) {
    if (this.socket) {
      this.socket.on('new_offer', callback);
    }
  }

  // Listen for offer selection notifications (for shop owners)
  onOfferSelected(callback: (selectionData: any) => void) {
    if (this.socket) {
      this.socket.on('offer_selected', callback);
    }
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();