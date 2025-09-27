import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchStudentApplications } from '../../store/slices/applicationSlice';

// Components
import Header from '../../components/shared/Header';
import ApplicationCard from '../../components/shared/ApplicationCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type ApplicationTrackingNavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ApplicationTracking'>;

const ApplicationTrackingScreen: React.FC = () => {
  const navigation = useNavigation<ApplicationTrackingNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { applications, loading } = useSelector((state: RootState) => state.applications);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'submitted' | 'under_review' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (currentUser?.id) {
      loadApplications();
    }
  }, [currentUser]);

  const loadApplications = async () => {
    if (currentUser?.id) {
      await dispatch(fetchStudentApplications(currentUser.id));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getFilteredApplications = () => {
    if (selectedFilter === 'all') {
      return applications;
    }
    return applications.filter(app => app.status === selectedFilter);
  };

  const getApplicationStatusCounts = () => {
    const counts = {
      all: applications.length,
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
  const filteredApplications = getFilteredApplications();

  const renderApplication = ({ item }: { item: any }) => (
    <ApplicationCard
      application={item}
      onPress={() => navigation.navigate('ApplicationDetails', { applicationId: item.id })}
      showStudentInfo={false}
      showBursaryInfo={true}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return <LoadingSpinner text="Loading your applications..." />;
    }

    if (selectedFilter === 'all') {
      return (
        <EmptyState
          icon="document-text-outline"
          title="No Applications Yet"
          description="Start applying to bursaries to see your applications here"
          actionText="Browse Bursaries"
          onActionPress={() => navigation.navigate('BursaryList')}
        />
      );
    }

    return (
      <EmptyState
        icon="filter-outline"
        title={`No ${selectedFilter.replace('_', ' ')} Applications`}
        description={`You don't have any ${selectedFilter.replace('_', ' ')} applications yet`}
        actionText="View All Applications"
        onActionPress={() => setSelectedFilter('all')}
      />
    );
  };

  const getFilterButtonStyle = (filter: string) => {
    return [
      styles.filterButton,
      selectedFilter === filter && styles.selectedFilterButton
    ];
  };

  const getFilterTextStyle = (filter: string) => {
    return [
      styles.filterButtonText,
      selectedFilter === filter && styles.selectedFilterButtonText
    ];
  };

  return (
    <View style={styles.container}>
      <Header title="My Applications" />
      
      {/* Status Overview */}
      <View style={styles.statusOverview}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScroll}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={getFilterTextStyle('all')}>All ({statusCounts.all})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('submitted')}
            onPress={() => setSelectedFilter('submitted')}
          >
            <Text style={getFilterTextStyle('submitted')}>Submitted ({statusCounts.submitted})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('under_review')}
            onPress={() => setSelectedFilter('under_review')}
          >
            <Text style={getFilterTextStyle('under_review')}>Under Review ({statusCounts.under_review})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('accepted')}
            onPress={() => setSelectedFilter('accepted')}
          >
            <Text style={getFilterTextStyle('accepted')}>Accepted ({statusCounts.accepted})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('rejected')}
            onPress={() => setSelectedFilter('rejected')}
          >
            <Text style={getFilterTextStyle('rejected')}>Rejected ({statusCounts.rejected})</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredApplications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusOverview: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  selectedFilterButton: {
    backgroundColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
});

export default ApplicationTrackingScreen;
