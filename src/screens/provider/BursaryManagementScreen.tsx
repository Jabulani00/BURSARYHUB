import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { fetchProviderBursaries, deleteBursary } from '../../store/slices/bursarySlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type BursaryManagementNavigationProp = NativeStackNavigationProp<ProviderStackParamList, 'BursaryManagement'>;

const BursaryManagementScreen: React.FC = () => {
  const navigation = useNavigation<BursaryManagementNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { bursaries, loading } = useSelector((state: RootState) => state.bursaries);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    if (currentUser?.id) {
      loadBursaries();
    }
  }, [currentUser]);

  const loadBursaries = async () => {
    if (currentUser?.id) {
      await dispatch(fetchProviderBursaries(currentUser.id));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBursaries();
    setRefreshing(false);
  };

  const handleDeleteBursary = (bursaryId: string, title: string) => {
    Alert.alert(
      'Delete Bursary',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteBursary(bursaryId)).unwrap();
              Alert.alert('Success', 'Bursary deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bursary');
            }
          },
        },
      ]
    );
  };

  const getFilteredBursaries = () => {
    const now = new Date();
    switch (selectedFilter) {
      case 'active':
        return bursaries.filter(b => b.isActive && new Date(b.deadline) > now);
      case 'expired':
        return bursaries.filter(b => new Date(b.deadline) <= now);
      default:
        return bursaries;
    }
  };

  const getBursaryCounts = () => {
    const now = new Date();
    const active = bursaries.filter(b => b.isActive && new Date(b.deadline) > now).length;
    const expired = bursaries.filter(b => new Date(b.deadline) <= now).length;
    const total = bursaries.length;

    return { active, expired, total };
  };

  const counts = getBursaryCounts();
  const filteredBursaries = getFilteredBursaries();

  const renderBursary = ({ item }: { item: any }) => {
    const isExpired = new Date(item.deadline) <= new Date();
    const isActive = item.isActive && !isExpired;

    return (
      <Card style={styles.bursaryCard}>
        <View style={styles.bursaryHeader}>
          <View style={styles.bursaryInfo}>
            <Text style={styles.bursaryTitle}>{item.title}</Text>
            <View style={styles.bursaryMeta}>
              <Text style={styles.bursaryField}>{item.fieldOfStudy.join(', ')}</Text>
              <Text style={styles.bursaryLevel}>
                {item.level === 'both' ? 'Undergraduate & Postgraduate' : item.level}
              </Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#4CAF50' : isExpired ? '#F44336' : '#757575' }
          ]}>
            <Text style={styles.statusBadgeText}>
              {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
            </Text>
          </View>
        </View>

        <Text style={styles.bursaryDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.bursaryDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.detailText}>
              Deadline: {item.deadline.toLocaleDateString('en-ZA')}
            </Text>
          </View>
          {item.amount && (
            <View style={styles.detailItem}>
              <Ionicons name="cash" size={16} color="#4CAF50" />
              <Text style={styles.detailText}>
                R{item.amount.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bursaryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditBursary', { bursaryId: item.id })}
          >
            <Ionicons name="pencil" size={16} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ApplicantReview', { bursaryId: item.id })}
          >
            <Ionicons name="people" size={16} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteBursary(item.id, item.title)}
          >
            <Ionicons name="trash" size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return <LoadingSpinner text="Loading your bursaries..." />;
    }

    if (selectedFilter === 'all') {
      return (
        <EmptyState
          icon="school-outline"
          title="No Bursaries Yet"
          description="Create your first bursary to start receiving applications from students"
          actionText="Create Bursary"
          onActionPress={() => navigation.navigate('CreateBursary')}
        />
      );
    }

    return (
      <EmptyState
        icon="filter-outline"
        title={`No ${selectedFilter} Bursaries`}
        description={`You don't have any ${selectedFilter} bursaries yet`}
        actionText="View All Bursaries"
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
      <Header 
        title="Manage Bursaries" 
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateBursary')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={getFilterTextStyle('all')}>All ({counts.total})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('active')}
            onPress={() => setSelectedFilter('active')}
          >
            <Text style={getFilterTextStyle('active')}>Active ({counts.active})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('expired')}
            onPress={() => setSelectedFilter('expired')}
          >
            <Text style={getFilterTextStyle('expired')}>Expired ({counts.expired})</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredBursaries}
        renderItem={renderBursary}
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
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterScroll: {
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
  bursaryCard: {
    marginBottom: 16,
  },
  bursaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bursaryInfo: {
    flex: 1,
    marginRight: 12,
  },
  bursaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bursaryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bursaryField: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  bursaryLevel: {
    fontSize: 12,
    color: '#666',
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
    lineHeight: 20,
    marginBottom: 12,
  },
  bursaryDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bursaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    // No additional styles needed
  },
  deleteButtonText: {
    color: '#F44336',
  },
});

export default BursaryManagementScreen;
