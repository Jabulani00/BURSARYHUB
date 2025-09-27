import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchProviderApplications, updateApplicationStatus } from '../../store/slices/applicationSlice';
import { fetchProviderBursaries } from '../../store/slices/bursarySlice';

// Components
import Header from '../../components/shared/Header';
import ApplicationCard from '../../components/shared/ApplicationCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type ApplicantReviewNavigationProp = NativeStackNavigationProp<ProviderStackParamList, 'ApplicantReview'>;
type ApplicantReviewRouteProp = RouteProp<ProviderStackParamList, 'ApplicantReview'>;

const ApplicantReviewScreen: React.FC = () => {
  const navigation = useNavigation<ApplicantReviewNavigationProp>();
  const route = useRoute<ApplicantReviewRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { applications, loading } = useSelector((state: RootState) => state.applications);
  const { bursaries } = useSelector((state: RootState) => state.bursaries);

  const { bursaryId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'submitted' | 'under_review' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (currentUser?.id) {
      await Promise.all([
        dispatch(fetchProviderApplications(currentUser.id)),
        dispatch(fetchProviderBursaries(currentUser.id)),
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStatusUpdate = (applicationId: string, status: 'accepted' | 'rejected', notes?: string) => {
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
            try {
              await dispatch(updateApplicationStatus({
                applicationId,
                status,
                notes,
              })).unwrap();
              
              Alert.alert('Success', `Application ${statusText}ed successfully`);
            } catch (error) {
              Alert.alert('Error', `Failed to ${statusText} application`);
            }
          },
        },
      ]
    );
  };

  const getFilteredApplications = () => {
    let filtered = applications;
    
    if (bursaryId !== 'all') {
      filtered = filtered.filter(app => app.bursaryId === bursaryId);
    }
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(app => app.status === selectedFilter);
    }
    
    return filtered;
  };

  const getApplicationStatusCounts = () => {
    let filtered = applications;
    
    if (bursaryId !== 'all') {
      filtered = filtered.filter(app => app.bursaryId === bursaryId);
    }
    
    const counts = {
      all: filtered.length,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
    };

    filtered.forEach(app => {
      counts[app.status]++;
    });

    return counts;
  };

  const getSelectedBursary = () => {
    if (bursaryId === 'all') return null;
    return bursaries.find(b => b.id === bursaryId);
  };

  const statusCounts = getApplicationStatusCounts();
  const filteredApplications = getFilteredApplications();
  const selectedBursary = getSelectedBursary();

  const renderApplication = ({ item }: { item: any }) => (
    <ApplicationCard
      application={item}
      onPress={() => navigation.navigate('ApplicationDetails', { applicationId: item.id })}
      showStudentInfo={true}
      showBursaryInfo={false}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return <LoadingSpinner text="Loading applications..." />;
    }

    if (selectedFilter === 'all') {
      return (
        <EmptyState
          icon="document-text-outline"
          title="No Applications Yet"
          description="Applications will appear here once students start applying to your bursaries"
          actionText="Create Bursary"
          onActionPress={() => navigation.navigate('CreateBursary')}
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
      <Header title="Review Applicants" />
      
      {/* Bursary Filter */}
      {bursaryId === 'all' && (
        <View style={styles.bursaryFilter}>
          <Text style={styles.filterLabel}>Filter by Bursary:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bursaryScroll}>
            <TouchableOpacity
              style={[styles.bursaryFilterButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => navigation.navigate('ApplicantReview', { bursaryId: 'all' })}
            >
              <Text style={[styles.bursaryFilterText, { color: '#FFFFFF' }]}>All Bursaries</Text>
            </TouchableOpacity>
            {bursaries.map((bursary) => (
              <TouchableOpacity
                key={bursary.id}
                style={styles.bursaryFilterButton}
                onPress={() => navigation.navigate('ApplicantReview', { bursaryId: bursary.id })}
              >
                <Text style={styles.bursaryFilterText}>{bursary.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Bursary Info */}
      {selectedBursary && (
        <View style={styles.selectedBursaryInfo}>
          <Text style={styles.selectedBursaryTitle}>{selectedBursary.title}</Text>
          <Text style={styles.selectedBursaryDescription}>
            {selectedBursary.description.substring(0, 100)}...
          </Text>
        </View>
      )}

      {/* Status Filter */}
      <View style={styles.statusFilter}>
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
  bursaryFilter: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  bursaryScroll: {
    paddingHorizontal: 16,
  },
  bursaryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  bursaryFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedBursaryInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedBursaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedBursaryDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusFilter: {
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

export default ApplicantReviewScreen;
