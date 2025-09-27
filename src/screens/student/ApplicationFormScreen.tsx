import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchBursaryById, clearCurrentBursary } from '../../store/slices/bursarySlice';
import { submitApplication } from '../../store/slices/applicationSlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type ApplicationFormNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ApplicationForm'>;
type ApplicationFormRouteProp = RouteProp<StudentStackParamList, 'ApplicationForm'>;

const ApplicationFormScreen: React.FC = () => {
  const navigation = useNavigation<ApplicationFormNavigationProp>();
  const route = useRoute<ApplicationFormRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentBursary, loading: bursaryLoading } = useSelector((state: RootState) => state.bursaries);
  const { currentUser, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { loading: applicationLoading } = useSelector((state: RootState) => state.applications);

  const { bursaryId } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBursaryById(bursaryId));
    
    return () => {
      dispatch(clearCurrentBursary());
    };
  }, [bursaryId]);

  const handleSubmitApplication = async () => {
    if (!currentUser || !currentBursary) {
      Alert.alert('Error', 'Unable to submit application. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        bursaryId: currentBursary.id,
        studentId: currentUser.id,
        providerId: currentBursary.providerId,
        studentInfo: {
          name: currentUser.name,
          email: currentUser.email,
          institution: (currentUser.profileData as any)?.institution || '',
          fieldOfStudy: (currentUser.profileData as any)?.fieldOfStudy || '',
          level: (currentUser.profileData as any)?.level || '',
        },
        bursaryInfo: {
          title: currentBursary.title,
          providerName: currentBursary.providerName,
          amount: currentBursary.amount,
        },
      };

      await dispatch(submitApplication(applicationData)).unwrap();
      
      Alert.alert(
        'Application Submitted',
        'Your application has been submitted successfully. You will receive updates via email.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ApplicationTracking'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const isExpired = currentBursary ? new Date(currentBursary.deadline) < new Date() : false;

  if (bursaryLoading || userLoading) {
    return <LoadingSpinner text="Loading application form..." />;
  }

  if (!currentBursary || !currentUser) {
    return (
      <View style={styles.container}>
        <Header title="Application Form" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load application form</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Application Form" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bursary Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bursary Summary</Text>
          <Text style={styles.bursaryTitle}>{currentBursary.title}</Text>
          <Text style={styles.providerName}>{currentBursary.providerName}</Text>
          
          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={16} color="#4CAF50" />
              <Text style={styles.summaryText}>{formatAmount(currentBursary.amount)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={16} color={isExpired ? "#F44336" : "#FF9800"} />
              <Text style={[styles.summaryText, isExpired && styles.expiredText]}>
                {getDaysUntilDeadline(currentBursary.deadline)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Application Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Application Information</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Applicant Name</Text>
            <Text style={styles.infoValue}>{currentUser.name}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{currentUser.email}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Institution</Text>
            <Text style={styles.infoValue}>
              {(currentUser.profileData as any)?.institution || 'Not specified'}
            </Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Field of Study</Text>
            <Text style={styles.infoValue}>
              {(currentUser.profileData as any)?.fieldOfStudy || 'Not specified'}
            </Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Level</Text>
            <Text style={styles.infoValue}>
              {(currentUser.profileData as any)?.level || 'Not specified'}
            </Text>
          </View>
        </Card>

        {/* Requirements Checklist */}
        <Card style={styles.requirementsCard}>
          <Text style={styles.sectionTitle}>Requirements Checklist</Text>
          <Text style={styles.requirementsNote}>
            Please ensure you meet all the following requirements before submitting your application:
          </Text>
          
          <View style={styles.requirementsList}>
            {currentBursary.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Important Notes */}
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <View style={styles.notesList}>
            <View style={styles.noteItem}>
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <Text style={styles.noteText}>
                Your application will be reviewed by the bursary provider
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="time" size={20} color="#FF9800" />
              <Text style={styles.noteText}>
                Application deadline: {formatDate(currentBursary.deadline)}
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="mail" size={20} color="#4CAF50" />
              <Text style={styles.noteText}>
                You will receive email updates about your application status
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="document" size={20} color="#9C27B0" />
              <Text style={styles.noteText}>
                Make sure all your documents are uploaded and up to date
              </Text>
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        <View style={styles.actionContainer}>
          <Button
            title={isExpired ? "Application Closed" : "Submit Application"}
            onPress={handleSubmitApplication}
            fullWidth
            disabled={isExpired || isSubmitting}
            loading={isSubmitting}
            variant={isExpired ? "secondary" : "primary"}
            style={styles.submitButton}
          />
          
          {isExpired && (
            <Text style={styles.expiredMessage}>
              This bursary application deadline has passed
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bursaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  expiredText: {
    color: '#F44336',
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
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  requirementsCard: {
    margin: 16,
    marginVertical: 8,
  },
  requirementsNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
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
  notesCard: {
    margin: 16,
    marginVertical: 8,
  },
  notesList: {
    marginTop: 8,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    padding: 16,
    paddingTop: 8,
  },
  submitButton: {
    marginBottom: 16,
  },
  expiredMessage: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ApplicationFormScreen;
