import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchBursaries, setFilters } from '../../store/slices/bursarySlice';
import { fetchStudentApplications } from '../../store/slices/applicationSlice';
import { logoutUser } from '../../store/slices/userSlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import BursaryCard from '../../components/shared/BursaryCard';
import ApplicationCard from '../../components/shared/ApplicationCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type StudentDashboardNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'StudentDashboard'>;

const StudentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<StudentDashboardNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { bursaries, loading: bursariesLoading } = useSelector((state: RootState) => state.bursaries);
  const { applications, loading: applicationsLoading } = useSelector((state: RootState) => state.applications);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (currentUser?.id) {
      // Load bursaries first (they're already in state from dummy data)
      if (bursaries.length === 0) {
        await dispatch(fetchBursaries({}));
      }
      
      // Then load applications
      await dispatch(fetchStudentApplications(currentUser.id));
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

  const statusCounts = getApplicationStatusCounts();
  const recentBursaries = bursaries.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const isLoading = applicationsLoading && applications.length === 0;

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
            Welcome to your BursaryHub dashboard. Here's what's happening with your applications.
          </Text>
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
              onPress={() => navigation.navigate('BursaryList')}
            >
              <Ionicons name="search" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Browse Bursaries</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ApplicationTracking')}
            >
              <Ionicons name="list" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>My Applications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('StudentProfile')}
            >
              <Ionicons name="person" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>My Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Bursaries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Bursaries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BursaryList')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBursaries.length > 0 ? (
            recentBursaries.map((bursary) => (
              <BursaryCard
                key={bursary.id}
                bursary={bursary}
                onPress={() => navigation.navigate('BursaryDetails', { bursaryId: bursary.id })}
                showAmount={true}
              />
            ))
          ) : (
            <EmptyState
              icon="school-outline"
              title="No Bursaries Available"
              description="Check back later for new bursary opportunities"
              actionText="Browse All Bursaries"
              onActionPress={() => navigation.navigate('BursaryList')}
            />
          )}
        </View>

        {/* Recent Applications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ApplicationTracking')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentApplications.length > 0 ? (
            recentApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onPress={() => navigation.navigate('ApplicationDetails', { applicationId: application.id })}
                showStudentInfo={false}
              />
            ))
          ) : (
            <EmptyState
              icon="document-text-outline"
              title="No Applications Yet"
              description="Start applying to bursaries to see your applications here"
              actionText="Browse Bursaries"
              onActionPress={() => navigation.navigate('BursaryList')}
            />
          )}
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
  statusCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
});

export default StudentDashboardScreen;
