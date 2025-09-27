import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../types';

// Import screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import BursaryListScreen from '../screens/student/BursaryListScreen';
import BursaryDetailsScreen from '../screens/student/BursaryDetailsScreen';
import ApplicationFormScreen from '../screens/student/ApplicationFormScreen';
import ApplicationTrackingScreen from '../screens/student/ApplicationTrackingScreen';
import ApplicationDetailsScreen from '../screens/student/ApplicationDetailsScreen';

const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="StudentDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="BursaryList" component={BursaryListScreen} />
      <Stack.Screen name="BursaryDetails" component={BursaryDetailsScreen} />
      <Stack.Screen name="ApplicationForm" component={ApplicationFormScreen} />
      <Stack.Screen name="ApplicationTracking" component={ApplicationTrackingScreen} />
      <Stack.Screen name="ApplicationDetails" component={ApplicationDetailsScreen} />
    </Stack.Navigator>
  );
};

export default StudentNavigator;
