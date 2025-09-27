import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import navigators
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import ProviderNavigator from './ProviderNavigator';
import AdminNavigator from './AdminNavigator';

// Import types
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);

  const getInitialRouteName = () => {
    if (!isAuthenticated || !currentUser) {
      return 'Auth';
    }

    switch (currentUser.role) {
      case 'student':
        return 'Student';
      case 'provider':
        return 'Provider';
      case 'admin':
        return 'Admin';
      default:
        return 'Auth';
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {currentUser?.role === 'student' && (
              <Stack.Screen name="Student" component={StudentNavigator} />
            )}
            {currentUser?.role === 'provider' && (
              <Stack.Screen name="Provider" component={ProviderNavigator} />
            )}
            {currentUser?.role === 'admin' && (
              <Stack.Screen name="Admin" component={AdminNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
