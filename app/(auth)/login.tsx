import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Login() {
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (user?.role === 'user') {
          router.replace('/(tabs)/search');
        } else {
          router.replace('/(tabs)/store');
        }
      } else {
        Alert.alert(
          'Login Failed',
          result.error || 'Please check your credentials'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your Bazaaro account</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              error={errors.password}
              placeholder="Enter your password"
              isPassword
            />

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/role-selection')}
            >
              <Text style={styles.registerLink}>
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>
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
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  registerLink: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
