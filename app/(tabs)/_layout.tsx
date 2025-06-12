import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Search, Store, User, MessageCircle } from 'lucide-react-native';
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
        {isShopOwner ? (
          // Shop Owner Tabs
          <>
            <Tabs.Screen
              name="store"
              options={{
                title: 'My Store',
                tabBarIcon: ({ size, color }) => (
                  <Store size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="requests"
              options={{
                title: 'Requests',
                tabBarIcon: ({ size, color }) => (
                  <MessageCircle size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profile',
                tabBarIcon: ({ size, color }) => (
                  <User size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                href: null, // Hide from shop owners
              }}
            />
            <Tabs.Screen
              name="offers"
              options={{
                href: null, // Hide from shop owners
              }}
            />
          </>
        ) : (
          // Customer Tabs
          <>
            <Tabs.Screen
              name="search"
              options={{
                title: 'Search',
                tabBarIcon: ({ size, color }) => (
                  <Search size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="offers"
              options={{
                title: 'Offers',
                tabBarIcon: ({ size, color }) => (
                  <MessageCircle size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profile',
                tabBarIcon: ({ size, color }) => (
                  <User size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="store"
              options={{
                href: null, // Hide from customers
              }}
            />
            <Tabs.Screen
              name="requests"
              options={{
                href: null, // Hide from customers
              }}
            />
          </>
        )}
      </Tabs>
    </SearchProvider>
  );
}
