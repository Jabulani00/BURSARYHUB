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

type UserManagementNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'UserManagement'>;

const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<UserManagementNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'student' | 'provider' | 'admin'>('all');

  // Mock data - replace with actual API calls
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-01-20'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@university.ac.za',
      role: 'provider',
      status: 'active',
      createdAt: new Date('2024-01-10'),
      lastLogin: new Date('2024-01-19'),
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'student',
      status: 'pending',
      createdAt: new Date('2024-01-18'),
      lastLogin: null,
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.co.za',
      role: 'provider',
      status: 'suspended',
      createdAt: new Date('2024-01-05'),
      lastLogin: new Date('2024-01-15'),
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Load users from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleUserAction = (userId: string, action: string) => {
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: () => {
            // TODO: Implement user action
            Alert.alert('Success', `User ${action}ed successfully`);
          },
        },
      ]
    );
  };

  const getFilteredUsers = () => {
    if (selectedFilter === 'all') {
      return mockUsers;
    }
    return mockUsers.filter(user => user.role === selectedFilter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'suspended':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return 'school';
      case 'provider':
        return 'business';
      case 'admin':
        return 'shield';
      default:
        return 'person';
    }
  };

  const filteredUsers = getFilteredUsers();

  const renderUser = ({ item }: { item: any }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name={getRoleIcon(item.role)} size={24} color="#757575" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userRole}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
      </View>

      <View style={styles.userMeta}>
        <Text style={styles.metaText}>
          Joined: {item.createdAt.toLocaleDateString('en-ZA')}
        </Text>
        {item.lastLogin && (
          <Text style={styles.metaText}>
            Last login: {item.lastLogin.toLocaleDateString('en-ZA')}
          </Text>
        )}
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUserAction(item.id, 'view')}
        >
          <Ionicons name="eye" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUserAction(item.id, 'edit')}
        >
          <Ionicons name="pencil" size={16} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {item.status === 'active' ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUserAction(item.id, 'suspend')}
          >
            <Ionicons name="pause" size={16} color="#FF9800" />
            <Text style={[styles.actionButtonText, { color: '#FF9800' }]}>Suspend</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUserAction(item.id, 'activate')}
          >
            <Ionicons name="play" size={16} color="#4CAF50" />
            <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Activate</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUserAction(item.id, 'delete')}
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
          icon="people-outline"
          title="No Users Found"
          description="No users have registered on the platform yet"
        />
      );
    }

    return (
      <EmptyState
        icon="filter-outline"
        title={`No ${selectedFilter}s Found`}
        description={`No ${selectedFilter}s have registered on the platform yet`}
        actionText="View All Users"
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
      <Header title="User Management" />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={getFilterButtonStyle('all')}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={getFilterTextStyle('all')}>All Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('student')}
            onPress={() => setSelectedFilter('student')}
          >
            <Text style={getFilterTextStyle('student')}>Students</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('provider')}
            onPress={() => setSelectedFilter('provider')}
          >
            <Text style={getFilterTextStyle('provider')}>Providers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getFilterButtonStyle('admin')}
            onPress={() => setSelectedFilter('admin')}
          >
            <Text style={getFilterTextStyle('admin')}>Admins</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
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
  userCard: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
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
  userMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  userActions: {
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

export default UserManagementScreen;
