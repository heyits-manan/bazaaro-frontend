import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShoppingBag, Store, ArrowRight } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function RoleSelection() {
  const handleUserRole = () => {
    router.push('/(auth)/register?role=user');
  };

  const handleShopOwnerRole = () => {
    router.push('/(auth)/register?role=shop-owner');
  };

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Bazaaro</Text>
            <Text style={styles.subtitle}>Choose your account type to get started</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={handleUserRole} activeOpacity={0.9}>
              <Card style={styles.optionCard}>
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <ShoppingBag size={32} color="#6366f1" />
                  </View>
                  <Text style={styles.optionTitle}>I'm a Customer</Text>
                  <Text style={styles.optionDescription}>
                    Search for products and get offers from nearby stores in real-time
                  </Text>
                  <View style={styles.features}>
                    <Text style={styles.feature}>• Search for any product</Text>
                    <Text style={styles.feature}>• Get instant offers</Text>
                    <Text style={styles.feature}>• Compare prices</Text>
                    <Text style={styles.feature}>• Navigate to stores</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <ArrowRight size={20} color="#6366f1" />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShopOwnerRole} activeOpacity={0.9}>
              <Card style={styles.optionCard}>
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Store size={32} color="#059669" />
                  </View>
                  <Text style={styles.optionTitle}>I'm a Shop Owner</Text>
                  <Text style={styles.optionDescription}>
                    Manage your store, respond to customer searches, and grow your business
                  </Text>
                  <View style={styles.features}>
                    <Text style={styles.feature}>• Manage your store</Text>
                    <Text style={styles.feature}>• Add products</Text>
                    <Text style={styles.feature}>• Respond to searches</Text>
                    <Text style={styles.feature}>• Real-time notifications</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <ArrowRight size={20} color="#059669" />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  optionCard: {
    padding: 24,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  feature: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
  },
  loginLink: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});