// navigation/AppNavigator.js
import React, { useContext,useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import { screens } from './screenImports';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { loggedIn, completedRegistration} = useContext(AuthContext);

  
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Conditional Navigation based on auth state */}
        {loggedIn && completedRegistration ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : loggedIn && !completedRegistration ? (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
      </Stack.Navigator>
    );

  
};

export default AppNavigator;