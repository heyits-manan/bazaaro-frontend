import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store as StoreIcon, Plus, Package, MapPin } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiService } from '../../services/api';
import * as Location from 'expo-location';
import { Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { StoreDetails } from '../../types/api';

export default function Store() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'shop_owner') {
    return <Redirect href="/(tabs)/search" />;
  }

  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeDetails, setStoreDetails] = useState<StoreDetails | null>(null);
  const [loadingStoreDetails, setLoadingStoreDetails] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
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

  useEffect(() => {
    getCurrentLocation();
    loadStoreDetails();
  }, []);

  const loadStoreDetails = async () => {
    setLoadingStoreDetails(true);
    try {
      const response = await apiService.getStoreDetails();
      if (response.success && response.data) {
        setStoreDetails(response.data);
        console.log('Store details loaded:', response.data);
      } else {
        console.log('No existing store found or error:', response.error);
      }
    } catch (error) {
      console.error('Error loading store details:', error);
    } finally {
      setLoadingStoreDetails(false);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to create a store'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCreateStore = async () => {
    if (!storeData.name || !storeData.address || !storeData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (useManualLocation) {
      latitude = parseFloat(manualLatitude);
      longitude = parseFloat(manualLongitude);
      if (isNaN(latitude) || isNaN(longitude)) {
        Alert.alert('Error', 'Please provide valid latitude and longitude');
        return;
      }
    } else {
      if (!location) {
        Alert.alert(
          'Error',
          'Location is required to create a store. Please enable location or enter coordinates manually.'
        );
        return;
      }
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    }

    setStoreLoading(true);
    try {
      const response = await apiService.createStore({
        ...storeData,
        latitude,
        longitude,
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
        setManualLatitude('');
        setManualLongitude('');
        setUseManualLocation(false);
      } else {
        Alert.alert('Error', response.error || 'Failed to create store');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setStoreLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productData.name || !productData.category || !productData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setStoreLoading(true);
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
      setStoreLoading(false);
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

        {/* Existing Store Information */}
        {storeDetails && (
          <Card style={styles.storeInfoCard}>
            <View style={styles.storeInfoHeader}>
              <Text style={styles.storeInfoTitle}>Store Information</Text>
              <View style={styles.storeStatus}>
                <Text
                  style={[
                    styles.storeStatusText,
                    {
                      color: storeDetails.store.isActive
                        ? '#10b981'
                        : '#ef4444',
                    },
                  ]}
                >
                  {storeDetails.store.isActive ? '🟢 Active' : '🔴 Inactive'}
                </Text>
              </View>
            </View>

            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{storeDetails.store.name}</Text>
              <Text style={styles.storeDescription}>
                {storeDetails.store.description}
              </Text>

              <View style={styles.storeLocation}>
                <MapPin size={16} color="#6366f1" />
                <Text style={styles.storeLocationText}>
                  {storeDetails.store.latitude}, {storeDetails.store.longitude}
                </Text>
              </View>

              <View style={styles.storeRating}>
                <Text style={styles.ratingText}>
                  Rating: {parseFloat(storeDetails.store.rating).toFixed(1)} ⭐
                </Text>
              </View>
            </View>

            {/* Store Statistics */}
            <View style={styles.statisticsContainer}>
              <Text style={styles.statisticsTitle}>Store Performance</Text>
              <View style={styles.statisticsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {storeDetails.store.statistics.totalProducts}
                  </Text>
                  <Text style={styles.statLabel}>Total Products</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {storeDetails.store.statistics.activeProducts}
                  </Text>
                  <Text style={styles.statLabel}>Active Products</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {storeDetails.store.statistics.totalOffers}
                  </Text>
                  <Text style={styles.statLabel}>Total Offers</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {storeDetails.store.statistics.acceptedOffers}
                  </Text>
                  <Text style={styles.statLabel}>Accepted Offers</Text>
                </View>
              </View>
              <View style={styles.acceptanceRate}>
                <Text style={styles.acceptanceRateText}>
                  Acceptance Rate:{' '}
                  {storeDetails.store.statistics.acceptanceRate}%
                </Text>
              </View>
            </View>

            <Button
              title="🔄 Refresh Store Info"
              variant="outline"
              size="small"
              onPress={loadStoreDetails}
              style={styles.refreshButton}
            />
          </Card>
        )}

        {/* Store Setup or Update */}
        <Card>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {storeDetails ? 'Update Store' : 'Store Setup'}
            </Text>
            {!showStoreForm ? (
              <View style={styles.setupContainer}>
                <Text style={styles.setupText}>
                  {storeDetails
                    ? 'Update your store information or add new products'
                    : 'Set up your store to start receiving customer requests'}
                </Text>
                <Button
                  title={storeDetails ? 'Update Store' : 'Create Store'}
                  onPress={() => setShowStoreForm(true)}
                  style={styles.setupButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Store Name *"
                  value={storeData.name}
                  onChangeText={(text) =>
                    setStoreData({ ...storeData, name: text })
                  }
                  placeholder="Enter store name"
                />

                <Input
                  label="Description"
                  value={storeData.description}
                  onChangeText={(text) =>
                    setStoreData({ ...storeData, description: text })
                  }
                  placeholder="Brief description of your store"
                  multiline
                  numberOfLines={3}
                />

                <Input
                  label="Address *"
                  value={storeData.address}
                  onChangeText={(text) =>
                    setStoreData({ ...storeData, address: text })
                  }
                  placeholder="Full store address"
                  multiline
                  numberOfLines={2}
                />

                <Input
                  label="Phone Number *"
                  value={storeData.phone}
                  onChangeText={(text) =>
                    setStoreData({ ...storeData, phone: text })
                  }
                  placeholder="Store contact number"
                  keyboardType="phone-pad"
                />

                {/* Location Section */}
                <Card style={styles.locationCard}>
                  <View style={styles.locationSection}>
                    <View style={styles.locationHeader}>
                      <MapPin size={20} color="#6366f1" />
                      <Text style={styles.locationTitle}>Store Location *</Text>
                    </View>

                    <Text style={styles.locationSubtitle}>
                      Choose how to set your store location
                    </Text>

                    {!useManualLocation && location ? (
                      <View style={styles.locationStatus}>
                        <Text style={styles.locationText}>
                          ✅ Device Location Found
                        </Text>
                        <Text style={styles.coordinatesText}>
                          {location.coords.latitude.toFixed(6)},{' '}
                          {location.coords.longitude.toFixed(6)}
                        </Text>
                      </View>
                    ) : useManualLocation ? (
                      <View style={styles.locationStatus}>
                        <Text style={styles.locationText}>
                          📝 Manual Location Entry
                        </Text>
                        <Text style={styles.coordinatesText}>
                          Enter coordinates below
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.locationStatus}>
                        <Text style={styles.locationText}>
                          {locationLoading
                            ? '🔄 Getting location...'
                            : '❌ Location not available'}
                        </Text>
                      </View>
                    )}

                    <Button
                      title={
                        useManualLocation
                          ? '📍 Use Device Location'
                          : '📝 Enter Location Manually'
                      }
                      variant="outline"
                      size="small"
                      onPress={() => setUseManualLocation((prev) => !prev)}
                      style={styles.locationButton}
                    />

                    {useManualLocation && (
                      <View style={styles.manualLocationInputs}>
                        <Text style={styles.inputLabel}>
                          Enter Store Coordinates:
                        </Text>
                        <Input
                          label="Latitude *"
                          value={manualLatitude}
                          onChangeText={setManualLatitude}
                          placeholder="e.g., 40.7128"
                          keyboardType="numeric"
                        />
                        <Input
                          label="Longitude *"
                          value={manualLongitude}
                          onChangeText={setManualLongitude}
                          placeholder="e.g., -74.0060"
                          keyboardType="numeric"
                        />
                        <Text style={styles.coordinateHelp}>
                          💡 You can find coordinates on Google Maps by
                          right-clicking on a location
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>

                <View style={styles.formActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => {
                      setShowStoreForm(false);
                      setManualLatitude('');
                      setManualLongitude('');
                      setUseManualLocation(false);
                    }}
                    style={styles.cancelButton}
                  />
                  <Button
                    title={storeLoading ? 'Creating...' : 'Create Store'}
                    onPress={handleCreateStore}
                    loading={storeLoading}
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
                  onChangeText={(text) =>
                    setProductData({ ...productData, name: text })
                  }
                  placeholder="Enter product name"
                />

                <Input
                  label="Category *"
                  value={productData.category}
                  onChangeText={(text) =>
                    setProductData({ ...productData, category: text })
                  }
                  placeholder="e.g., Electronics, Clothing"
                />

                <Input
                  label="Price ($) *"
                  value={productData.price}
                  onChangeText={(text) =>
                    setProductData({ ...productData, price: text })
                  }
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <Input
                  label="Description"
                  value={productData.description}
                  onChangeText={(text) =>
                    setProductData({ ...productData, description: text })
                  }
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
                    title={storeLoading ? 'Adding...' : 'Add Product'}
                    onPress={handleAddProduct}
                    loading={storeLoading}
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
            • Add detailed product descriptions{'\n'}• Keep your inventory
            updated{'\n'}• Respond quickly to customer requests{'\n'}• Set
            competitive prices
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
  section: {},
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
  addButton: {},
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
  setupButton: {},
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
  locationCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationSection: {
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  locationStatus: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  locationButton: {
    width: '100%',
    marginBottom: 16,
  },
  manualLocationInputs: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'left',
    width: '100%',
    fontWeight: '500',
  },
  coordinateHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  storeInfoCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  storeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  storeStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#e0f2fe',
  },
  storeStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  storeDetails: {
    marginBottom: 16,
  },
  storeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeLocationText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  storeRating: {
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statisticsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statCard: {
    width: '45%', // Adjust as needed for two columns
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  acceptanceRate: {
    alignItems: 'center',
  },
  acceptanceRateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0369a1',
  },
  refreshButton: {
    width: '100%',
  },
});
