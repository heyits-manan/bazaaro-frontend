import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { SearchProvider } from '../contexts/SearchContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <WebSocketProvider>
          <SearchProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </SearchProvider>
        </WebSocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
