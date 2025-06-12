import { Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function TabIndex() {
  const { user } = useAuth();

  // Redirect to the appropriate tab based on user role
  if (user?.role === 'shop_owner') {
    return <Redirect href="/(tabs)/store" />;
  }

  // For regular users, redirect to search
  return <Redirect href="/(tabs)/search" />;
}
