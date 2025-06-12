import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store as StoreIcon, Plus, Package } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiService } from '../../services/api';
import * as Location from 'expo-location';

export default function Store() {
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
  });
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
  });

  const handleCreateStore = async () => {
    if (!storeData.name || !storeData.address || !storeData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get current location for the store
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to create a store');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const response = await apiService.createStore({
        ...storeData,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (response.success) {
        Alert.alert('Success', 'Store created successfully!');
        setShowStoreForm(false);
        setStoreData({
          name: '',
          description: '',
          address: '',
          phone: '',
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to create store');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productData.name || !productData.category || !productData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.addProduct({
        ...productData,
        price: parseFloat(productData.price),
        store_id: 'your-store-id', // This should come from your store state
      });

      if (response.success) {
        Alert.alert('Success', 'Product added successfully!');
        setShowProductForm(false);
        setProductData({
          name: '',
          category: '',
          price: '',
          description: '',
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to add product');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <StoreIcon size={32} color="#6366f1" />
          <Text style={styles.title}>My Store</Text>
          <Text style={styles.subtitle}>Manage your store and products</Text>
        </View>

        <Card>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Setup</Text>
            {!showStoreForm ? (
              <View style={styles.setupContainer}>
                <Text style={styles.setupText}>
                  Set up your store to start receiving customer requests
                </Text>
                <Button
                  title="Create Store"
                  onPress={() => setShowStoreForm(true)}
                  style={styles.setupButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Store Name *"
                  value={storeData.name}
                  onChangeText={(text) => setStoreData({ ...storeData, name: text })}
                  placeholder="Enter store name"
                />

                <Input
                  label="Description"
                  value={storeData.description}
                  onChangeText={(text) => setStoreData({ ...storeData, description: text })}
                  placeholder="Brief description of your store"
                  multiline
                  numberOfLines={3}
                />

                <Input
                  label="Address *"
                  value={storeData.address}
                  onChangeText={(text) => setStoreData({ ...storeData, address: text })}
                  placeholder="Full store address"
                  multiline
                  numberOfLines={2}
                />

                <Input
                  label="Phone Number *"
                  value={storeData.phone}
                  onChangeText={(text) => setStoreData({ ...storeData, phone: text })}
                  placeholder="Store contact number"
                  keyboardType="phone-pad"
                />

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setShowStoreForm(false)}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={loading ? 'Creating...' : 'Create Store'}
                    onPress={handleCreateStore}
                    loading={loading}
                    style={styles.createButton}
                  />
                </View>
              </View>
            )}
          </View>
        </Card>

        <Card>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Products</Text>
              <Button
                title="Add Product"
                size="small"
                onPress={() => setShowProductForm(true)}
                style={styles.addButton}
              />
            </View>

            {showProductForm && (
              <View style={styles.form}>
                <Input
                  label="Product Name *"
                  value={productData.name}
                  onChangeText={(text) => setProductData({ ...productData, name: text })}
                  placeholder="Enter product name"
                />

                <Input
                  label="Category *"
                  value={productData.category}
                  onChangeText={(text) => setProductData({ ...productData, category: text })}
                  placeholder="e.g., Electronics, Clothing"
                />

                <Input
                  label="Price ($) *"
                  value={productData.price}
                  onChangeText={(text) => setProductData({ ...productData, price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <Input
                  label="Description"
                  value={productData.description}
                  onChangeText={(text) => setProductData({ ...productData, description: text })}
                  placeholder="Product description"
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setShowProductForm(false)}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={loading ? 'Adding...' : 'Add Product'}
                    onPress={handleAddProduct}
                    loading={loading}
                    style={styles.createButton}
                  />
                </View>
              </View>
            )}

            <View style={styles.emptyProducts}>
              <Package size={48} color="#6b7280" />
              <Text style={styles.emptyTitle}>No Products Yet</Text>
              <Text style={styles.emptyText}>
                Add products to your store to start receiving customer requests
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Store Management Tips</Text>
          <Text style={styles.tipText}>
            • Add detailed product descriptions{'\n'}
            • Keep your inventory updated{'\n'}
            • Respond quickly to customer requests{'\n'}
            • Set competitive prices
          </Text>
        </Card>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  addButton: {
  },
  setupContainer: {
    alignItems: 'center',
    padding: 20,
  },
  setupText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  setupButton: {
  },
  form: {
    marginTop: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
  emptyProducts: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
});