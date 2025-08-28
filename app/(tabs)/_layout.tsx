import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import {
  Search,
  Store,
  User,
  MessageCircle,
  History,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { SearchProvider } from '../../contexts/SearchContext';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  const isShopOwner = user.role === 'shop_owner';

  return (
    <SearchProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: 8,
            paddingTop: 8,
            height: 88,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
            href: isShopOwner ? null : '/search', // Hide for shop owners
          }}
        />
        <Tabs.Screen
          name="offers"
          options={{
            title: 'Offers',
            tabBarIcon: ({ size, color }) => (
              <MessageCircle size={size} color={color} />
            ),
            href: isShopOwner ? null : '/offers', // Hide for shop owners
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            title: 'My Store',
            tabBarIcon: ({ size, color }) => (
              <Store size={size} color={color} />
            ),
            href: !isShopOwner ? null : '/store', // Hide for customers
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: 'Requests',
            tabBarIcon: ({ size, color }) => (
              <MessageCircle size={size} color={color} />
            ),
            href: !isShopOwner ? null : '/requests', // Hide for customers
          }}
        />
        <Tabs.Screen
          name="store-offers"
          options={{
            title: 'My Offers',
            tabBarIcon: ({ size, color }) => (
              <Store size={size} color={color} />
            ),
            href: !isShopOwner ? null : '/store-offers', // Hide for customers
          }}
        />
        <Tabs.Screen
          name="my-searches"
          options={{
            title: 'My Searches',
            tabBarIcon: ({ size, color }) => (
              <History size={size} color={color} />
            ),
            href: isShopOwner ? null : '/my-searches', // Hide for shop owners
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </SearchProvider>
  );
}
