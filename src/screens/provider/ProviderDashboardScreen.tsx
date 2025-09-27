import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchProviderBursaries } from '../../store/slices/bursarySlice';
import { fetchProviderApplications } from '../../store/slices/applicationSlice';
import { logoutUser } from '../../store/slices/userSlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type ProviderDashboardNavigationProp = NativeStackNavigationProp<ProviderStackParamList, 'ProviderDashboard'>;

const ProviderDashboardScreen: React.FC = () => {
  const navigation = useNavigation<ProviderDashboardNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { bursaries, loading: bursariesLoading } = useSelector((state: RootState) => state.bursaries);
  const { applications, loading: applicationsLoading } = useSelector((state: RootState) => state.applications);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (currentUser?.id) {
      await Promise.all([
        dispatch(fetchProviderBursaries(currentUser.id)),
        dispatch(fetchProviderApplications(currentUser.id)),
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getApplicationStatusCounts = () => {
    const counts = {
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
    };

    applications.forEach(app => {
      counts[app.status]++;
    });

    return counts;
  };

  const getBursaryStats = () => {
    const activeBursaries = bursaries.filter(b => b.isActive);
    const expiredBursaries = bursaries.filter(b => new Date(b.deadline) < new Date());
    const totalApplications = applications.length;

    return {
      active: activeBursaries.length,
      expired: expiredBursaries.length,
      totalApplications,
    };
  };

  const statusCounts = getApplicationStatusCounts();
  const bursaryStats = getBursaryStats();
  const recentBursaries = bursaries.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const isLoading = bursariesLoading || applicationsLoading;

  if (isLoading && !refreshing) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Dashboard" 
        rightComponent={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Text style={styles.greeting}>
            {getGreeting()}, {currentUser?.name?.split(' ')[0]}!
          </Text>
          <Text style={styles.welcomeText}>
            Welcome to your BursaryHub provider dashboard. Manage your bursaries and review applications.
          </Text>
        </Card>

        {/* Bursary Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Bursaries</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bursaryStats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bursaryStats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{bursaryStats.totalApplications}</Text>
              <Text style={styles.statLabel}>Total Applications</Text>
            </View>
          </View>
        </Card>

        {/* Application Status Overview */}
        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>{statusCounts.submitted}</Text>
              <Text style={styles.statusLabel}>Submitted</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>{statusCounts.under_review}</Text>
              <Text style={styles.statusLabel}>Under Review</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>{statusCounts.accepted}</Text>
              <Text style={styles.statusLabel}>Accepted</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>{statusCounts.rejected}</Text>
              <Text style={styles.statusLabel}>Rejected</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateBursary')}
            >
              <Ionicons name="add" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Create Bursary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BursaryManagement')}
            >
              <Ionicons name="list" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Manage Bursaries</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ApplicantReview', { bursaryId: 'all' })}
            >
              <Ionicons name="people" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Review Applicants</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Bursaries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bursaries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BursaryManagement')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBursaries.length > 0 ? (
            recentBursaries.map((bursary) => (
              <Card key={bursary.id} style={styles.bursaryCard}>
                <View style={styles.bursaryHeader}>
                  <Text style={styles.bursaryTitle}>{bursary.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: bursary.isActive ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {bursary.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.bursaryDescription} numberOfLines={2}>
                  {bursary.description}
                </Text>
                <View style={styles.bursaryFooter}>
                  <Text style={styles.bursaryDeadline}>
                    Deadline: {bursary.deadline.toLocaleDateString('en-ZA')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ApplicantReview', { bursaryId: bursary.id })}
                  >
                    <Text style={styles.reviewText}>Review Applications</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="school-outline"
              title="No Bursaries Yet"
              description="Create your first bursary to start receiving applications"
              actionText="Create Bursary"
              onActionPress={() => navigation.navigate('CreateBursary')}
            />
          )}
        </View>

        {/* Recent Applications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ApplicantReview', { bursaryId: 'all' })}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentApplications.length > 0 ? (
            recentApplications.map((application) => (
              <Card key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <Text style={styles.applicationTitle}>{application.bursaryInfo.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(application.status) }
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {getStatusText(application.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.applicantName}>{application.studentInfo.name}</Text>
                <Text style={styles.applicantDetails}>
                  {application.studentInfo.institution} • {application.studentInfo.fieldOfStudy}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ApplicationDetails', { applicationId: application.id })}
                  style={styles.viewDetailsButton}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="document-text-outline"
              title="No Applications Yet"
              description="Applications will appear here once students start applying to your bursaries"
              actionText="Create Bursary"
              onActionPress={() => navigation.navigate('CreateBursary')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
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
    default:
      return '#757575';
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
    default:
      return 'Unknown';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    marginRight: -8,
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statusCard: {
    margin: 16,
    marginVertical: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  bursaryCard: {
    marginBottom: 12,
  },
  bursaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bursaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bursaryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bursaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bursaryDeadline: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  applicationCard: {
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  applicantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  applicantDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});

export default ProviderDashboardScreen;
