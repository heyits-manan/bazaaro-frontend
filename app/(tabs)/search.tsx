import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { apiService } from '../../services/api';
import { router } from 'expo-router';
import { useSearch } from '../../contexts/SearchContext';

export default function Search() {
  const { setActiveSearchId } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [radius, setRadius] = useState('5');
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

    if (!location) {
      Alert.alert('Error', 'Location is required to search for nearby stores');
      return;
    }

    setLoading(true);
    try {
      const searchData = {
        product_name: searchQuery.trim(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
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
            {location ? (
              <Text style={styles.locationText}>
                Location found • {location.coords.latitude.toFixed(4)},{' '}
                {location.coords.longitude.toFixed(4)}
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
                locationLoading ? 'Getting Location...' : 'Update Location'
              }
              variant="outline"
              size="small"
              onPress={getCurrentLocation}
              loading={locationLoading}
              style={styles.locationButton}
            />
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
});
