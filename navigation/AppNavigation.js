import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatDetailsScreen from '../screens/ChatDetailsScreen';
import LikeScreen from '../screens/LikeScreen';
import MaybeScreen from '../screens/MaybeScreen';
//sign up screens
import Landing from '../models/landing';
import Login from '../models/login';
import Number from '../models/number';
import Numberverify from '../models/numberverify';
import Password from '../models/password';
import Name from '../models/name';
import Gender from '../models/gender'; 
import Preference from '../models/preference';
import Photo from '../models/photo';
import Userlocation from '../models/userlocation';
import Bio from '../models/bio'
import Habit from '../models/habit'
import Confirm from '../models/confirm'
import Open from '../models/open'
import Email from '../models/email'
import Emailverify from '../models/emailverify'
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';


//imports for icons
import { Image } from 'react-native';
import HomeScreenIcon from '../assets/home-page-icon.png';
import ChatScreenIcon from '../assets/chat-page-icon.png';
import ProfileScreenIcon from '../assets/profile-page-icon.png';
import LikeScreenIcon from '../assets/like-page-icon.png';
import MaybeScreenIcon from '../assets/maybe-page-icon.png';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigation(){
    const HomeTabs = ({route}) => {
        const userId = route.params.userIdLogin;
        console.log('userIdHIII:', userId);
        return(
            <Tab.Navigator screenOptions={({ route }) =>  ({
                    headerShown: false,
                    
                    tabBarIcon: ({ focused }) => {
                        
                        let iconSource;
                        if (route.name === 'Home') {
                            iconSource = HomeScreenIcon;
                        } else if (route.name === 'Chat') {
                            iconSource = ChatScreenIcon;
                        } else if (route.name === 'Profile') {
                            iconSource = ProfileScreenIcon;
                        } else if (route.name === 'Like') {
                            iconSource = LikeScreenIcon;
                        } else if (route.name === 'Maybe') {
                            iconSource = MaybeScreenIcon;
                        }

                        const iconStyle = {
                            width: wp(10), 
                            height: wp(10),
                            tintColor: focused ? "#E8D1FF" : 'grey', 
                            //backgroundColor: 'red',
                        };
                    
                    return(
                        <Image 
                            source={iconSource} 
                            style={iconStyle} 
                            resizeMode={"contain"}/>);
                    },

                    //show or nah?
                    //tabBarShowLabel: false,
                    tabBarLabel: ({ focused }) => {
                        let label = route.name;
                        let color = focused ? "#E8D1FF" : 'grey'; 

                        return (
                            <Text style={{ color, fontSize: hp(2), textAlign: 'center' }}>{label}</Text>
                        );
                    },
                    tabBarStyle: {
                        height: hp(12), // Adjust the height of the bottom tab bar
                        paddingVertical: hp(1), // Adjust the padding of the bottom tab bar
                        backgroundColor: '#FFFFFF', // Customize background color if needed
                        alignItems: 'center', // Centers items horizontally in the tab
                        justifyContent: 'center', // Centers items vertically in the tab
                    },
                    
                })}  
            >   


                
                <Tab.Screen name="Home">
                {(props) => <HomeScreen {...props} userId={userId} />}
            </Tab.Screen>
            <Tab.Screen name="Maybe">
                {(props) => <MaybeScreen {...props} userId={userId} />}
            </Tab.Screen>
            <Tab.Screen name="Like">
                {(props) => <LikeScreen {...props} userId={userId} />}
            </Tab.Screen>
            <Tab.Screen name="Chat">
                {(props) => <ChatScreen {...props} userId={userId} />}
            </Tab.Screen>
            <Tab.Screen name="Profile">
                {(props) => <ProfileScreen {...props} userId={userId} />}
            </Tab.Screen>

                
            </Tab.Navigator>
        );
    };

    return(
       
            <Stack.Navigator
                //initialRouteName="HomeTabs"
                initialRouteName= "Open"
                screenOptions={{ 
                        animation: 'fade', 
                        transitionDuration: 200,
                }}
            >
                {/* SIGN UP SCREENS */}
                <Stack.Screen 
                    name="Landing" 
                    component={Landing} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen
                    name="Number"
                    component={Number}
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Login" 
                    component={Login} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Numberverify" 
                    component={Numberverify} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Password" 
                    component={Password} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Name" 
                    component={Name}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Gender" 
                    component={Gender}
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="Preference" 
                    component={Preference} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Photo" 
                    component={Photo} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Userlocation" 
                    component={Userlocation} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Bio" 
                    component={Bio} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Habit" 
                    component={Habit} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Confirm" 
                    component={Confirm} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Open" 
                    component={Open} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Email" 
                    component={Email} 
                    options={{ headerShown: false }} 
                />
                <Stack.Screen 
                    name="Emailverify" 
                    component={Emailverify} 
                    options={{ headerShown: false }} 
                />
                




                {/* MAIN SCREENS */}
                <Stack.Screen 
                    name="HomeTabs" 
                    component={HomeTabs}
                    options={{ headerShown: false }}  
                />
                
                {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
                <Stack.Screen 
                    name="ChatDetails" 
                    component={ChatDetailsScreen} 
                    options={{ headerShown: false }} 
                />
                {/* <Stack.Screen name="OtherProfile" component={OtherProfileScreen} /> */}
                <Stack.Screen 
                    name="HomeFilter" 
                    component={HomeScreen} 
                    options={{ presentation: 'modal', headerShown: false }} 
                    
                />
            </Stack.Navigator>
            
     
    );
}
