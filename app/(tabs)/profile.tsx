import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Store, LogOut, Mail, Phone } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/role-selection');
          },
        },
      ]
    );
  };

  const isShopOwner = user?.role === 'shop_owner';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {isShopOwner ? (
              <Store size={32} color="#fff" />
            ) : (
              <UserIcon size={32} color="#fff" />
            )}
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>
            {isShopOwner ? 'Shop Owner' : 'Customer'}
          </Text>
        </View>

        <Card>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.infoItem}>
              <Mail size={20} color="#6b7280" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            {user?.phone && (
              <View style={styles.infoItem}>
                <Phone size={20} color="#6b7280" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>
              {isShopOwner ? 'Store Statistics' : 'Activity Statistics'}
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>
                  {isShopOwner ? 'Total Offers Sent' : 'Searches Made'}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>
                  {isShopOwner ? 'Offers Accepted' : 'Offers Received'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.actionsCard}>
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            
            <Button
              title="Sign Out"
              variant="outline"
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bazaaro v1.0.0</Text>
          <Text style={styles.footerText}>
            {isShopOwner 
              ? 'Connecting businesses with customers'
              : 'Finding great deals nearby'
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  infoSection: {
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  statsCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  statsSection: {
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0369a1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#0369a1',
    textAlign: 'center',
  },
  actionsCard: {
  },
  actionsSection: {
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
});