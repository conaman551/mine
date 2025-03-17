// navigation/AuthStack.js
import React,{useContext} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screens } from './screenImports';
import { AuthContext } from '../context/AuthContext';


const Stack = createNativeStackNavigator();



const AuthStack = () => {
  const { completedRegistration} = useContext(AuthContext);
  return (
  <Stack.Navigator
    initialRouteName={completedRegistration ? "Name" : "Landing"}
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
    <Stack.Screen name="Name" component={screens.Name} />
    <Stack.Screen name="Gender" component={screens.Gender} />
    <Stack.Screen name="Preference" component={screens.Preference} />
    <Stack.Screen name="Photo" component={screens.Photo} />
    <Stack.Screen name="Userlocation" component={screens.Userlocation} />
    <Stack.Screen name="Bio" component={screens.Bio} />
    <Stack.Screen name="Habit" component={screens.Habit}/>
    <Stack.Screen name="Confirm" component={screens.Confirm}/>
    <Stack.Screen name="Open" component={screens.Open} />
    <Stack.Screen name="Email" component={screens.Email} />
    <Stack.Screen name="Emailverify" component={screens.Emailverify} />
  </Stack.Navigator> )
};

/**
   
 */

export default AuthStack;