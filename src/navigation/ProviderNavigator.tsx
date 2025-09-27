import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '../types';

// Import screens
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import BursaryManagementScreen from '../screens/provider/BursaryManagementScreen';
import CreateBursaryScreen from '../screens/provider/CreateBursaryScreen';
import EditBursaryScreen from '../screens/provider/EditBursaryScreen';
import ApplicantReviewScreen from '../screens/provider/ApplicantReviewScreen';
import ApplicationDetailsScreen from '../screens/provider/ApplicationDetailsScreen';

const Stack = createNativeStackNavigator<ProviderStackParamList>();

const ProviderNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProviderDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
      <Stack.Screen name="BursaryManagement" component={BursaryManagementScreen} />
      <Stack.Screen name="CreateBursary" component={CreateBursaryScreen} />
      <Stack.Screen name="EditBursary" component={EditBursaryScreen} />
      <Stack.Screen name="ApplicantReview" component={ApplicantReviewScreen} />
      <Stack.Screen name="ApplicationDetails" component={ApplicationDetailsScreen} />
    </Stack.Navigator>
  );
};

export default ProviderNavigator;
