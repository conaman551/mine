// navigation/AuthStack.js
import React,{useContext} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screens } from './screenImports';



const Stack = createNativeStackNavigator();



const AuthStack = () => {

  return (
  <Stack.Navigator
    initialRouteName={"Landing"}
    screenOptions={{ 
      animation: 'fade',
      transitionDuration: 200,
      headerShown: false 
    }}
  >
    <Stack.Screen name="Landing" component={screens.Landing} />
    <Stack.Screen name="Number" component={screens.Number} />
    <Stack.Screen name="Login" component={screens.Login} />
    <Stack.Screen name="Numberverify" component={screens.Numberverify} />
    <Stack.Screen name="Password" component={screens.Password} />
    <Stack.Screen name="Email" component={screens.Email} />
    <Stack.Screen name="Emailverify" component={screens.Emailverify} />
  </Stack.Navigator> )
};

/**
   
 */

export default AuthStack;