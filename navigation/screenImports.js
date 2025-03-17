// navigation/screenImports.js
// Centralize all screen and icon imports
export const screens = {
    // Main screens
    ProfileScreen: require('../screens/ProfileScreen').default,
    HomeScreen: require('../screens/HomeScreen').default,
    ChatScreen: require('../screens/ChatScreen').default,
    ChatDetailsScreen: require('../screens/ChatDetailsScreen').default,
    LikeScreen: require('../screens/LikeScreen').default,
    MaybeScreen: require('../screens/MaybeScreen').default,
    
    // Auth screens
    Landing: require('../models/landing').default,
    Login: require('../models/login').default,
    Number: require('../models/number').default,
    Numberverify: require('../models/numberverify').default,
    Password: require('../models/password').default,
    Name: require('../models/name').default,
    Gender: require('../models/gender').default,
    Preference: require('../models/preference').default,
    Photo: require('../models/photo').default,
    Userlocation: require('../models/userlocation').default,
    Bio: require('../models/bio').default,
    Habit: require('../models/habit').default,
    Confirm: require('../models/confirm').default,
    Open: require('../models/open').default,
    Email: require('../models/email').default,
    Emailverify: require('../models/emailverify').default,
  };
  
  export const icons = {
    HomeScreenIcon: require('../assets/home-page-icon.png'),
    ChatScreenIcon: require('../assets/chat-page-icon.png'),
    ProfileScreenIcon: require('../assets/profile-page-icon.png'),
    LikeScreenIcon: require('../assets/like-page-icon.png'),
    MaybeScreenIcon: require('../assets/maybe-page-icon.png'),
  };