import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { Ionicons } from '@expo/vector-icons';

type BursaryOversightNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'BursaryOversight'>;

const BursaryOversightScreen: React.FC = () => {
  const navigation = useNavigation<BursaryOversightNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');

  // Mock data - replace with actual API calls
  const mockBursaries = [
    {
      id: '1',
      title: 'Engineering Excellence Bursary',
      providerName: 'TechCorp SA',
      description: 'Supporting future engineers in South Africa',
      status: 'active',
      applications: 45,
      deadline: new Date('2024-03-15'),
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      title: 'Medical Studies Scholarship',
      providerName: 'Health Foundation',
      description: 'Funding for medical students',
      status: 'active',
      applications: 23,
      deadline: new Date('2024-02-28'),
      createdAt: new Date('2024-01-05'),
    },
    {
      id: '3',
      title: 'Business Innovation Grant',
      providerName: 'Entrepreneur Hub',
      description: 'Supporting business students',
      status: 'expired',
      applications: 67,
      deadline: new Date('2024-01-31'),
      createdAt: new Date('2023-12-20'),
    },
    {
      id: '4',
      title: 'Arts and Culture Bursary',
      providerName: 'Cultural Society',
      description: 'Promoting arts education',
      status: 'pending',
      applications: 12,
      deadline: new Date('2024-04-30'),
      createdAt: new Date('2024-01-18'),
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Load bursaries from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleBursaryAction = (bursaryId: string, action: string) => {
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Bursary`,
      `Are you sure you want to ${action} this bursary?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: () => {
            // TODO: Implement bursary action
            Alert.alert('Success', `Bursary ${action}ed successfully`);
          },
        },
      ]
    );
  };

  const getFilteredBursaries = () => {
    if (selectedFilter === 'all') {
      return mockBursaries;
    }
    return mockBursaries.filter(bursary => bursary.status === selectedFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'expired':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const filteredBursaries = getFilteredBursaries();

  const renderBursary = ({ item }: { item: any }) => (
    <Card style={styles.bursaryCard}>
      <View style={styles.bursaryHeader}>
        <View style={styles.bursaryInfo}>
          <Text style={styles.bursaryTitle}>{item.title}</Text>
          <Text style={styles.providerName}>{item.providerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>

      <Text style={styles.bursaryDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.bursaryStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#8B5CF6" />
          <Text style={styles.statText}>{item.applications} applications</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color="#FF9800" />
          <Text style={styles.statText}>
            Deadline: {item.deadline.toLocaleDateString('en-ZA')}
          </Text>
        </View>
      </View>

      <View style={styles.bursaryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBursaryAction(item.id, 'view')}
        >
          <Ionicons name="eye" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBursaryAction(item.id, 'edit')}
        >
          <Ionicons name="pencil" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {item.status === 'active' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBursaryAction(item.id, 'deactivate')}
          >
            <Ionicons name="pause" size={16} color="#FF9800" />
            <Text style={[styles.actionButtonText, { color: '#FF9800' }]}>Deactivate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBursaryAction(item.id, 'activate')}
          >
            <Ionicons name="play" size={16} color="#4CAF50" />
            <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Activate</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBursaryAction(item.id, 'delete')}
        >
          <Ionicons name="trash" size={16} color="#F44336" />
          <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmpty = () => {
    if (selectedFilter === 'all') {
      return (
        <EmptyState
          icon="school-outline"
          title="No Bursaries Found"
          description="No bursaries have been created on the platform yet"
        />
      );
    }

    return (
      <EmptyState
        icon="filter-outline"
        title={`No ${selectedFilter} Bursaries`}
        description={`No ${selectedFilter} bursaries found`}
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
      <Header title="Bursary Oversight" />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={getFilterTextStyle('all')}>All Bursaries</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('active')}
            onPress={() => setSelectedFilter('active')}
          >
            <Text style={getFilterTextStyle('active')}>Active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('expired')}
            onPress={() => setSelectedFilter('expired')}
          >
            <Text style={getFilterTextStyle('expired')}>Expired</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('pending')}
            onPress={() => setSelectedFilter('pending')}
          >
            <Text style={getFilterTextStyle('pending')}>Pending</Text>
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
  providerName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
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
  bursaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default BursaryOversightScreen;
