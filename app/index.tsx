import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    if (user?.role === 'shop_owner') {
      return <Redirect href="/(tabs)/store" />;
    } else {
      return <Redirect href="/(tabs)/search" />;
    }
  }

  return <Redirect href="/(auth)/role-selection" />;
}
