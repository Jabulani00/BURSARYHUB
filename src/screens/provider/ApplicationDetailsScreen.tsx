import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchApplicationById, clearCurrentApplication, updateApplicationStatus } from '../../store/slices/applicationSlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type ApplicationDetailsNavigationProp = NativeStackNavigationProp<ProviderStackParamList, 'ApplicationDetails'>;
type ApplicationDetailsRouteProp = RouteProp<ProviderStackParamList, 'ApplicationDetails'>;

const ApplicationDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ApplicationDetailsNavigationProp>();
  const route = useRoute<ApplicationDetailsRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentApplication, loading } = useSelector((state: RootState) => state.applications);

  const { applicationId } = route.params;
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchApplicationById(applicationId));
    
    return () => {
      dispatch(clearCurrentApplication());
    };
  }, [applicationId]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#FF9800';
      case 'under_review':
        return '#8B5CF6';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'withdrawn':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'time';
      case 'under_review':
        return 'eye';
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'withdrawn':
        return 'arrow-back-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return 'Unknown';
    }
  };

  const handleStatusUpdate = (status: 'accepted' | 'rejected') => {
    const statusText = status === 'accepted' ? 'accept' : 'reject';
    
    Alert.alert(
      `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} Application`,
      `Are you sure you want to ${statusText} this application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: statusText.charAt(0).toUpperCase() + statusText.slice(1),
          style: status === 'accepted' ? 'default' : 'destructive',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await dispatch(updateApplicationStatus({
                applicationId,
                status,
              })).unwrap();
              
              Alert.alert('Success', `Application ${statusText}ed successfully`);
            } catch (error) {
              Alert.alert('Error', `Failed to ${statusText} application`);
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleMarkUnderReview = async () => {
    setIsUpdating(true);
    try {
      await dispatch(updateApplicationStatus({
        applicationId,
        status: 'under_review',
      })).unwrap();
      
      Alert.alert('Success', 'Application marked as under review');
    } catch (error) {
      Alert.alert('Error', 'Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading application details..." />;
  }

  if (!currentApplication) {
    return (
      <View style={styles.container}>
        <Header title="Application Details" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Application not found</Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(currentApplication.status);
  const statusIcon = getStatusIcon(currentApplication.status);
  const statusText = getStatusText(currentApplication.status);

  return (
    <View style={styles.container}>
      <Header title="Application Details" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Ionicons name={statusIcon} size={24} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
            <Text style={styles.submittedDate}>
              Submitted: {formatDate(currentApplication.submittedAt)}
            </Text>
          </View>
        </Card>

        {/* Bursary Information */}
        <Card style={styles.bursaryCard}>
          <Text style={styles.sectionTitle}>Bursary Information</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Bursary Title</Text>
            <Text style={styles.infoValue}>{currentApplication.bursaryInfo.title}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Provider</Text>
            <Text style={styles.infoValue}>{currentApplication.bursaryInfo.providerName}</Text>
          </View>
        </Card>

        {/* Applicant Information */}
        <Card style={styles.applicantCard}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{currentApplication.studentInfo.name}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{currentApplication.studentInfo.email}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Institution</Text>
            <Text style={styles.infoValue}>{currentApplication.studentInfo.institution}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Field of Study</Text>
            <Text style={styles.infoValue}>{currentApplication.studentInfo.fieldOfStudy}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Level</Text>
            <Text style={styles.infoValue}>{currentApplication.studentInfo.level}</Text>
          </View>
        </Card>

        {/* Application Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Application Timeline</Text>
          
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Application Submitted</Text>
                <Text style={styles.timelineDate}>{formatDate(currentApplication.submittedAt)}</Text>
              </View>
            </View>
            
            {currentApplication.status !== 'submitted' && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Status Updated</Text>
                  <Text style={styles.timelineDate}>{formatDate(currentApplication.updatedAt)}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Notes */}
        {currentApplication.notes && (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{currentApplication.notes}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        {currentApplication.status === 'submitted' && (
          <Card style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <View style={styles.actionButtons}>
              <Button
                title="Mark Under Review"
                onPress={handleMarkUnderReview}
                variant="outline"
                style={styles.actionButton}
                loading={isUpdating}
              />
              
              <Button
                title="Accept Application"
                onPress={() => handleStatusUpdate('accepted')}
                style={styles.actionButton}
                loading={isUpdating}
              />
              
              <Button
                title="Reject Application"
                onPress={() => handleStatusUpdate('rejected')}
                variant="danger"
                style={styles.actionButton}
                loading={isUpdating}
              />
            </View>
          </Card>
        )}

        {/* Status Information */}
        <Card style={styles.statusInfoCard}>
          <Text style={styles.sectionTitle}>Status Information</Text>
          
          <View style={styles.statusInfoList}>
            {currentApplication.status === 'submitted' && (
              <View style={styles.statusInfoItem}>
                <Ionicons name="time" size={20} color="#FF9800" />
                <Text style={styles.statusInfoText}>
                  This application is waiting for your review
                </Text>
              </View>
            )}
            
            {currentApplication.status === 'under_review' && (
              <View style={styles.statusInfoItem}>
                <Ionicons name="eye" size={20} color="#8B5CF6" />
                <Text style={styles.statusInfoText}>
                  This application is currently under review
                </Text>
              </View>
            )}
            
            {currentApplication.status === 'accepted' && (
              <View style={styles.statusInfoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.statusInfoText}>
                  This application has been accepted
                </Text>
              </View>
            )}
            
            {currentApplication.status === 'rejected' && (
              <View style={styles.statusInfoItem}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.statusInfoText}>
                  This application has been rejected
                </Text>
              </View>
            )}
            
            <View style={styles.statusInfoItem}>
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.statusInfoText}>
                The applicant will be notified of any status changes
              </Text>
            </View>
          </View>
        </Card>
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
  statusCard: {
    margin: 16,
    marginBottom: 8,
  },
  statusHeader: {
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  submittedDate: {
    fontSize: 14,
    color: '#666',
  },
  bursaryCard: {
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
  applicantCard: {
    margin: 16,
    marginVertical: 8,
  },
  timelineCard: {
    margin: 16,
    marginVertical: 8,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#666',
  },
  notesCard: {
    margin: 16,
    marginVertical: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  statusInfoCard: {
    margin: 16,
    marginVertical: 8,
  },
  statusInfoList: {
    marginTop: 8,
  },
  statusInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default ApplicationDetailsScreen;
