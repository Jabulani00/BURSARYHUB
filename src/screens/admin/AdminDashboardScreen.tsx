import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/userSlice';

// Components
import Header from '../../components/shared/Header';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Load admin dashboard data
    setTimeout(() => setRefreshing(false), 1000);
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

  // Mock data - replace with actual API calls
  const mockStats = {
    totalUsers: 1250,
    totalBursaries: 89,
    totalApplications: 2340,
    activeProviders: 45,
  };

  const mockRecentActivity = [
    { id: 1, type: 'user', action: 'New user registered', time: '2 hours ago' },
    { id: 2, type: 'bursary', action: 'New bursary created', time: '4 hours ago' },
    { id: 3, type: 'application', action: 'Application submitted', time: '6 hours ago' },
    { id: 4, type: 'provider', action: 'Provider verified', time: '8 hours ago' },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title="Admin Dashboard" 
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
            Welcome to the BursaryHub admin dashboard. Monitor system activity and manage the platform.
          </Text>
        </Card>

        {/* System Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{mockStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="school" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{mockStats.totalBursaries}</Text>
              <Text style={styles.statLabel}>Total Bursaries</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>{mockStats.totalApplications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="business" size={24} color="#9C27B0" />
              <Text style={styles.statNumber}>{mockStats.activeProviders}</Text>
              <Text style={styles.statLabel}>Active Providers</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <Ionicons name="people" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BursaryOversight')}
            >
              <Ionicons name="school" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Bursary Oversight</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('SystemSettings')}
            >
              <Ionicons name="settings" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>System Settings</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {mockRecentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons 
                    name={
                      activity.type === 'user' ? 'person-add' :
                      activity.type === 'bursary' ? 'school' :
                      activity.type === 'application' ? 'document-text' :
                      'business'
                    } 
                    size={20} 
                    color="#8B5CF6" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.action}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* System Health */}
        <Card style={styles.healthCard}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthItems}>
            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.healthText}>Database: Online</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.healthText}>Authentication: Online</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.healthText}>File Storage: Online</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.healthText}>Email Service: Online</Text>
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
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
  activityCard: {
    margin: 16,
    marginVertical: 8,
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  healthCard: {
    margin: 16,
    marginVertical: 8,
  },
  healthItems: {
    marginTop: 8,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthIndicator: {
    marginRight: 12,
  },
  healthText: {
    fontSize: 14,
    color: '#333',
  },
});

export default AdminDashboardScreen;
