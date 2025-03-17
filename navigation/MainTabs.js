// navigation/MainTabs.js
import React from 'react';
import { Image,Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { screens, icons } from './screenImports';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  

  const getTabBarIcon = (routeName, focused) => {
    const iconsMap = {
      Home: icons.HomeScreenIcon,
      Chat: icons.ChatScreenIcon,
      Profile: icons.ProfileScreenIcon,
      Like: icons.LikeScreenIcon,
      Maybe: icons.MaybeScreenIcon
    };

    return (
      <Image
        source={iconsMap[routeName]}
        style={{
          width: wp(10),
          height: wp(10),
          tintColor: focused ? "#E8D1FF" : 'grey',
        }}
        resizeMode="contain"
      />
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => getTabBarIcon(route.name, focused),
        tabBarLabel: ({ focused }) => (
          <Text style={{ 
            color: focused ? "#E8D1FF" : 'grey', 
            fontSize: hp(2), 
            textAlign: 'center' 
          }}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          height: hp(12),
          paddingVertical: hp(1),
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        },
      })}
    >
      {['Home', 'Maybe', 'Like', 'Chat', 'Profile'].map(screen => (
        <Tab.Screen
          key={screen}
          name={screen}
          component={props => screens[`${screen}Screen`]({ ...props })}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainTabs;