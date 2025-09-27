import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchBursaryById, clearCurrentBursary } from '../../store/slices/bursarySlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type BursaryDetailsNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'BursaryDetails'>;
type BursaryDetailsRouteProp = RouteProp<StudentStackParamList, 'BursaryDetails'>;

const BursaryDetailsScreen: React.FC = () => {
  const navigation = useNavigation<BursaryDetailsNavigationProp>();
  const route = useRoute<BursaryDetailsRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentBursary, loading } = useSelector((state: RootState) => state.bursaries);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const { bursaryId } = route.params;
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    dispatch(fetchBursaryById(bursaryId));
    
    return () => {
      dispatch(clearCurrentBursary());
    };
  }, [bursaryId]);

  useEffect(() => {
    if (currentBursary) {
      setIsExpired(new Date(currentBursary.deadline) < new Date());
    }
  }, [currentBursary]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Amount not specified';
    return `R${amount.toLocaleString()}`;
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  const handleApply = () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please log in to apply for bursaries');
      return;
    }

    if (isExpired) {
      Alert.alert('Application Closed', 'This bursary application deadline has passed');
      return;
    }

    // Check if user has completed profile
    const profile = currentUser.profileData;
    if (!profile || !profile.institution || !profile.fieldOfStudy) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile before applying for bursaries',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Profile', onPress: () => navigation.navigate('StudentProfile') }
        ]
      );
      return;
    }

    navigation.navigate('ApplicationForm', { bursaryId });
  };

  if (loading) {
    return <LoadingSpinner text="Loading bursary details..." />;
  }

  if (!currentBursary) {
    return (
      <View style={styles.container}>
        <Header title="Bursary Details" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bursary not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Bursary Details" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{currentBursary.title}</Text>
            <Text style={styles.provider}>{currentBursary.providerName}</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, isExpired && styles.expiredBadge]}>
                <Text style={[styles.statusText, isExpired && styles.expiredText]}>
                  {isExpired ? 'Expired' : 'Active'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Key Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Key Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="cash" size={20} color="#4CAF50" />
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{formatAmount(currentBursary.amount)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color={isExpired ? "#F44336" : "#FF9800"} />
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={[styles.infoValue, isExpired && styles.expiredText]}>
                {formatDate(currentBursary.deadline)}
              </Text>
              <Text style={[styles.infoSubtext, isExpired && styles.expiredText]}>
                {getDaysUntilDeadline(currentBursary.deadline)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="person" size={20} color="#8B5CF6" />
              <Text style={styles.infoLabel}>Level</Text>
              <Text style={styles.infoValue}>
                {currentBursary.level === 'both' ? 'Undergraduate & Postgraduate' : currentBursary.level}
              </Text>
            </View>
            
            {currentBursary.duration && (
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color="#9C27B0" />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{currentBursary.duration}</Text>
              </View>
            )}
            
            {currentBursary.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color="#FF5722" />
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{currentBursary.location}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{currentBursary.description}</Text>
        </Card>

        {/* Fields of Study */}
        <Card style={styles.fieldsCard}>
          <Text style={styles.sectionTitle}>Fields of Study</Text>
          <View style={styles.fieldsContainer}>
            {currentBursary.fieldOfStudy.map((field, index) => (
              <View key={index} style={styles.fieldTag}>
                <Text style={styles.fieldText}>{field}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Requirements */}
        <Card style={styles.requirementsCard}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsList}>
            {currentBursary.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Application Button */}
        <View style={styles.actionContainer}>
          <Button
            title={isExpired ? "Application Closed" : "Apply Now"}
            onPress={handleApply}
            fullWidth
            disabled={isExpired}
            variant={isExpired ? "secondary" : "primary"}
            style={styles.applyButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  provider: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  expiredBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expiredText: {
    color: '#FFFFFF',
  },
  infoCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  descriptionCard: {
    margin: 16,
    marginVertical: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  fieldsCard: {
    margin: 16,
    marginVertical: 8,
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fieldTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  fieldText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  requirementsCard: {
    margin: 16,
    marginVertical: 8,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  actionContainer: {
    padding: 16,
    paddingTop: 8,
  },
  applyButton: {
    marginBottom: 16,
  },
});

export default BursaryDetailsScreen;
