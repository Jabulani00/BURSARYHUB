import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { loginUser, clearError } from '../../store/slices/userSlice';
import { LoginForm } from '../../types';

// Components
import Header from '../../components/shared/Header';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<LoginForm>>({});
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Demo credentials for quick testing
  const demoCredentials = [
    { email: 'student@demo.com', password: 'demo123', role: 'Student', icon: '🎓' },
    { email: 'provider@demo.com', password: 'demo123', role: 'Provider', icon: '🏢' },
    { email: 'admin@demo.com', password: 'demo123', role: 'Admin', icon: '👨‍💼' },
  ];

  const validateForm = (): boolean => {
    const errors: Partial<LoginForm> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(loginUser(formData)).unwrap();
      // Navigation will be handled by AppNavigator based on user role
    } catch (error) {
      Alert.alert('Login Failed', error as string);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
    setShowDemoCredentials(false);
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  if (loading) {
    return <LoadingSpinner text="Signing you in..." />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Welcome Back" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="school" size={50} color="#8B5CF6" />
            </View>
            <Text style={styles.appName}>BursaryHub</Text>
            <Text style={styles.tagline}>Your Gateway to Educational Funding</Text>
          </View>
          
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Sign in to your BursaryHub account to continue
          </Text>

            {/* Demo Credentials Toggle */}
            <TouchableOpacity 
              style={styles.demoToggle}
              onPress={() => setShowDemoCredentials(!showDemoCredentials)}
            >
              <Ionicons 
                name={showDemoCredentials ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#8B5CF6" 
              />
              <Text style={styles.demoToggleText}>
                {showDemoCredentials ? 'Hide' : 'Show'} Demo Credentials
              </Text>
            </TouchableOpacity>

            {/* Demo Credentials */}
            {showDemoCredentials && (
              <View style={styles.demoContainer}>
                <Text style={styles.demoTitle}>Demo Accounts</Text>
                <Text style={styles.demoSubtitle}>Click any account to auto-fill</Text>
                {demoCredentials.map((cred, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.demoCard}
                    onPress={() => handleDemoLogin(cred.email, cred.password)}
                  >
                    <Text style={styles.demoIcon}>{cred.icon}</Text>
                    <View style={styles.demoInfo}>
                      <Text style={styles.demoRole}>{cred.role}</Text>
                      <Text style={styles.demoEmail}>{cred.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={formErrors.email}
              leftIcon="mail"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              error={formErrors.password}
              leftIcon="lock-closed"
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Sign In"
              onPress={handleLogin}
              fullWidth
              style={styles.loginButton}
              icon="log-in"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Continue with Google"
              onPress={() => {
                // TODO: Implement Google Sign-In
                Alert.alert('Coming Soon', 'Google Sign-In will be available soon');
              }}
              variant="outline"
              fullWidth
              style={styles.googleButton}
              icon="logo-google"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Sign Up"
              onPress={navigateToRegister}
              variant="outline"
              size="small"
              icon="person-add"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  demoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoToggleText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  demoInfo: {
    flex: 1,
  },
  demoRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  demoEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  form: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default LoginScreen;
