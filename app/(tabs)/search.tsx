import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
  Search as SearchIcon,
  MapPin,
  Filter,
  MessageCircle,
  Clock,
} from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { apiService } from '../../services/api';
import { router } from 'expo-router';
import { useSearch } from '../../contexts/SearchContext';
import {
  Search as SearchType,
  Offer,
  UserSearchesResponse,
} from '../../types/api';

export default function Search() {
  const { activeSearchId, setActiveSearchId } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [radius, setRadius] = useState('5');
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [currentSearch, setCurrentSearch] = useState<SearchType | null>(null);
  const [currentOffers, setCurrentOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (activeSearchId) {
      loadCurrentSearchDetails();
    }
  }, [activeSearchId]);

  const loadCurrentSearchDetails = async () => {
    if (!activeSearchId) return;

    setLoadingOffers(true);
    try {
      // Load search details
      const searchResponse = await apiService.getUserSearches();
      console.log('Search response:', searchResponse);

      if (searchResponse.success && searchResponse.data) {
        // The API returns { message: "...", searches: [...] }
        // So searchResponse.data.searches contains the array
        const searches = searchResponse.data.searches;

        if (searches && Array.isArray(searches)) {
          const search = searches.find((s) => s.id === activeSearchId);
          if (search) {
            setCurrentSearch(search);
            console.log('Found current search:', search);

            // If the search already includes offers, use them
            if (search.offers && Array.isArray(search.offers)) {
              setCurrentOffers(search.offers);
              console.log(
                'Set offers from search response:',
                search.offers.length
              );
              setLoadingOffers(false);
              return; // No need to make another API call
            }
          } else {
            console.log('Current search not found in user searches');
          }
        } else {
          console.log(
            'Unexpected search response structure:',
            searchResponse.data
          );
        }
      } else {
        console.log('Search response not successful:', searchResponse.error);
      }

      // Only load offers separately if they weren't included in the search response
      const offersResponse = await apiService.getOffers(activeSearchId);
      console.log('Offers response:', offersResponse);

      if (offersResponse.success && offersResponse.data) {
        // Handle different possible response structures
        const offers = offersResponse.data as any;

        // If data is an array, use it directly
        if (Array.isArray(offers)) {
          setCurrentOffers(offers);
          console.log('Set offers from array:', offers.length);
        }
        // If data has an offers property (like OffersResponse)
        else if (offers.offers && Array.isArray(offers.offers)) {
          setCurrentOffers(offers.offers);
          console.log('Set offers from offers property:', offers.offers.length);
        }
        // If data has a different structure, log it for debugging
        else {
          console.log('Unexpected offers response structure:', offers);
        }
      } else {
        console.log('Offers response not successful:', offersResponse.error);
      }
    } catch (error) {
      console.error('Error loading search details:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to find nearby stores'
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a product name');
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
          'Location is required to search for nearby stores'
        );
        return;
      }
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    }

    setLoading(true);
    try {
      const searchData = {
        product_name: searchQuery.trim(),
        latitude,
        longitude,
      };

      console.log('Sending search request with data:', searchData);
      const response = await apiService.createSearch(searchData);
      console.log('Search response:', response);

      if (response.success && response.data) {
        console.log('Setting active search ID:', response.data.search.id);
        setActiveSearchId(response.data.search.id);
        console.log(
          'Navigating to offers with search ID:',
          response.data.search.id
        );
        router.replace({
          pathname: '/(tabs)/offers',
          params: { searchId: response.data.search.id },
        });
      } else {
        console.error('Error Searching Store: ', response.error);
        console.log('Response from search: ', response);
        console.log('Search Data: ', searchData);
        Alert.alert('Error', response.error || 'Failed to create search');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SearchIcon size={32} color="#6366f1" />
          <Text style={styles.title}>Search Products</Text>
          <Text style={styles.subtitle}>
            Find what you need from nearby stores
          </Text>
        </View>

        <Card>
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <MapPin size={20} color="#6366f1" />
              <Text style={styles.locationTitle}>Your Location</Text>
            </View>
            {!useManualLocation && location ? (
              <Text style={styles.locationText}>
                Location found • {location.coords.latitude.toFixed(4)},{' '}
                {location.coords.longitude.toFixed(4)}
              </Text>
            ) : useManualLocation ? (
              <Text style={styles.locationText}>
                Manual location entry enabled
              </Text>
            ) : (
              <Text style={styles.locationText}>
                {locationLoading
                  ? 'Getting location...'
                  : 'Location not available'}
              </Text>
            )}
            <Button
              title={
                useManualLocation
                  ? 'Use Device Location'
                  : 'Enter Location Manually'
              }
              variant="outline"
              size="small"
              onPress={() => setUseManualLocation((prev) => !prev)}
              style={styles.locationButton}
            />
            {useManualLocation && (
              <View style={{ marginTop: 12 }}>
                <Input
                  label="Latitude"
                  value={manualLatitude}
                  onChangeText={setManualLatitude}
                  placeholder="Enter latitude"
                  keyboardType="numeric"
                />
                <Input
                  label="Longitude"
                  value={manualLongitude}
                  onChangeText={setManualLongitude}
                  placeholder="Enter longitude"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </Card>

        <Card>
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>What are you looking for?</Text>

            <Input
              label="Product Name"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="e.g., iPhone 15, Nike shoes, etc."
            />

            <Input
              label="Category (Optional)"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Electronics, Clothing, etc."
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Max Price ($)"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="Any price"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Search Radius (km)"
                  value={radius}
                  onChangeText={setRadius}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button
              title={loading ? 'Searching...' : 'Search Nearby Stores'}
              onPress={handleSearch}
              loading={loading}
              disabled={!location}
              style={styles.searchButton}
            />
          </View>
        </Card>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Search Tips</Text>
          <Text style={styles.tipText}>
            • Be specific with product names for better results{'\n'}• Set a
            realistic price range to get quality offers{'\n'}• Nearby stores
            will be notified instantly{'\n'}• You'll receive offers in real-time
          </Text>
        </Card>

        {/* Current Search Status */}
        {currentSearch && (
          <Card style={styles.currentSearchCard}>
            <View style={styles.currentSearchHeader}>
              <MessageCircle size={24} color="#6366f1" />
              <Text style={styles.currentSearchTitle}>Current Search</Text>
            </View>

            <View style={styles.currentSearchInfo}>
              <Text style={styles.currentSearchProduct}>
                {currentSearch.productName}
              </Text>
              <View style={styles.currentSearchMeta}>
                <Clock size={14} color="#6b7280" />
                <Text style={styles.currentSearchTime}>
                  {new Date(currentSearch.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.currentSearchStatus}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color:
                      currentSearch.status === 'completed'
                        ? '#10b981'
                        : currentSearch.status === 'cancelled'
                        ? '#ef4444'
                        : '#f59e0b',
                  },
                ]}
              >
                {currentSearch.status === 'completed'
                  ? 'Completed'
                  : currentSearch.status === 'cancelled'
                  ? 'Cancelled'
                  : 'Pending'}
              </Text>
            </View>

            {currentOffers.length > 0 && (
              <View style={styles.offersSummary}>
                <Text style={styles.offersLabel}>
                  {currentOffers.length} offer
                  {currentOffers.length !== 1 ? 's' : ''} received
                </Text>
                <Button
                  title="View All Offers"
                  onPress={() =>
                    router.push(`/(tabs)/offers?searchId=${activeSearchId}`)
                  }
                  size="small"
                  style={styles.viewOffersButton}
                />
              </View>
            )}

            {currentSearch.status === 'pending' && (
              <Button
                title="View Offers"
                onPress={() =>
                  router.push(`/(tabs)/offers?searchId=${activeSearchId}`)
                }
                style={styles.viewOffersButton}
              />
            )}
          </Card>
        )}
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
  locationSection: {
    marginBottom: 8,
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
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  locationButton: {
    alignSelf: 'flex-start',
  },
  searchSection: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  searchButton: {
    marginTop: 8,
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
  currentSearchCard: {
    marginTop: 16,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  currentSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentSearchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  currentSearchInfo: {
    marginBottom: 12,
  },
  currentSearchProduct: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  currentSearchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentSearchTime: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  currentSearchStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  offersSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offersLabel: {
    fontSize: 14,
    color: '#374151',
  },
  viewOffersButton: {
    alignSelf: 'flex-end',
  },
});
