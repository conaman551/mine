// navigation/AuthStack.js
import React,{useContext} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screens } from './screenImports';
import { AuthContext } from '../context/AuthContext';


const Stack = createNativeStackNavigator();



const RegStack = () => {
  const {regScreen} = useContext(AuthContext);
  const screenarr = ['Name','Gender','Preference','Photo','Userlocation','Bio','Habit','Confirm'] //0-7
  return (
  <Stack.Navigator
    initialRouteName={screenarr[regScreen]}
    screenOptions={{ 
      animation: 'fade',
      transitionDuration: 200,
      headerShown: false 
    }}
  >
   <Stack.Screen name="Name" component={screens.Name} />
    <Stack.Screen name="Gender" component={screens.Gender} />
    <Stack.Screen name="Preference" component={screens.Preference} />
    <Stack.Screen name="Photo" component={screens.Photo} />
    <Stack.Screen name="Userlocation" component={screens.Userlocation} />
    <Stack.Screen name="Bio" component={screens.Bio} />
    <Stack.Screen name="Habit" component={screens.Habit}/>
    <Stack.Screen name="Confirm" component={screens.Confirm}/>
    <Stack.Screen name="Open" component={screens.Open} />
  </Stack.Navigator> )
};

/**
   
 */

export default RegStack;