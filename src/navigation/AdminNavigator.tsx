import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types';

// Import screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import BursaryOversightScreen from '../screens/admin/BursaryOversightScreen';
import SystemSettingsScreen from '../screens/admin/SystemSettingsScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="BursaryOversight" component={BursaryOversightScreen} />
      <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
