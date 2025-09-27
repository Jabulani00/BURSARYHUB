import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList, RegisterForm } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { registerUser } from '../../store/slices/userSlice';

// Components
import Header from '../../components/shared/Header';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Card from '../../components/shared/Card';

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'>;
type RoleSelectionScreenRouteProp = RouteProp<AuthStackParamList, 'RoleSelection'>;

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();
  const route = useRoute<RoleSelectionScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const { formData } = route.params;
  const [selectedRole, setSelectedRole] = useState<'student' | 'provider' | null>(null);

  const handleRoleSelect = (role: 'student' | 'provider') => {
    setSelectedRole(role);
  };

  const handleCompleteRegistration = async () => {
    if (!selectedRole) {
      Alert.alert('Selection Required', 'Please select your role to continue');
      return;
    }

    try {
      await dispatch(registerUser({
        ...formData,
        role: selectedRole,
      })).unwrap();
      
      // Navigation will be handled by AppNavigator based on user role
    } catch (error) {
      Alert.alert('Registration Failed', error as string);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return <LoadingSpinner text="Creating your account..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="Select Your Role" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="people" size={40} color="#8B5CF6" />
            </View>
            <Text style={styles.appName}>BursaryHub</Text>
            <Text style={styles.tagline}>Choose Your Path</Text>
          </View>
          
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'll be using BursaryHub
          </Text>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'student' && styles.selectedRoleCard
              ]}
              onPress={() => handleRoleSelect('student')}
              activeOpacity={0.8}
            >
              <View style={styles.roleCardContent}>
                <View style={styles.roleIcon}>
                  <Ionicons 
                    name="school" 
                    size={40} 
                    color={selectedRole === 'student' ? '#8B5CF6' : '#6B7280'} 
                  />
                </View>
                <Text style={styles.roleTitle}>Student</Text>
                <Text style={styles.roleDescription}>
                  I'm looking for bursary opportunities to fund my education
                </Text>
                <View style={styles.roleFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="search" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Browse available bursaries</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="document-text" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Submit applications</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="time" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Track application status</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="folder" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Manage documents</Text>
                  </View>
                </View>
                {selectedRole === 'student' && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'provider' && styles.selectedRoleCard
              ]}
              onPress={() => handleRoleSelect('provider')}
              activeOpacity={0.8}
            >
              <View style={styles.roleCardContent}>
                <View style={styles.roleIcon}>
                  <Ionicons 
                    name="business" 
                    size={40} 
                    color={selectedRole === 'provider' ? '#8B5CF6' : '#6B7280'} 
                  />
                </View>
                <Text style={styles.roleTitle}>Bursary Provider</Text>
                <Text style={styles.roleDescription}>
                  I represent an organization that offers bursaries to students
                </Text>
                <View style={styles.roleFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="add-circle" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Post bursary opportunities</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="eye" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Review applications</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="people" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Manage applicants</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="analytics" size={16} color="#8B5CF6" />
                    <Text style={styles.featureText}>Track bursary performance</Text>
                  </View>
                </View>
                {selectedRole === 'provider' && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Complete Registration"
            onPress={handleCompleteRegistration}
            fullWidth
            style={styles.completeButton}
            disabled={!selectedRole}
            icon="checkmark"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              You can change your role later in settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 24,
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
  roleContainer: {
    marginBottom: 32,
  },
  roleCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedRoleCard: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  roleCardContent: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  roleIcon: {
    marginBottom: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 50,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  roleFeatures: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  completeButton: {
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;
