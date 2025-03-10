import { ActivityIndicator, View, Text, ScrollView, TouchableOpacity, Image, StyleSheet} from 'react-native'
import React, { useEffect, useState } from 'react'
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import iceSpiceTemp from '../assets/icespicetemp.png'
import { localAddress } from '../constants';

export default function Matches({userId}) {
  const navigation = useNavigation();
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  console.log('userIdMATCHES1213:', userId);
  useFocusEffect(React.useCallback(() => {
    // Fetch datesData from the backend using the userId
    fetch(`${localAddress}/chats/${userId}`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched Data44:', data);
        setChatData(data); // Set fetched data to state
        setLoading(false);  // Stop loading
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);  // Stop loading in case of error
      });
  }, [userId]));

  // Display loading spinner while fetching data
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

   // Fetch chat data for specific match when a match is clicked
   const handlePress = async (UID1, UID2, name, img, chat_id, url1) => {
    try {
      // Fetch chat history for both users
      const response = await fetch(`${localAddress}/chats/messages/${chat_id}`);
      const chatHistory = await response.json();
      console.log("chatid123", UID1, UID2);
      // Navigate to ChatDetailsScreen and pass chat history and other details
      navigation.navigate('ChatDetails', {
        name: name,
        img: img, 
        chat: chatHistory,  // Pass the fetched chat history
        UID1: UID1,
        UID2: UID2,  // Passing both UIDs for future messages
        chat_id: chat_id,
        userId: userId,
        url1: url1,
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {chatData.reverse().map((match, index) => {
          return (
            <TouchableOpacity 
            key={index}
            style={styles.matchContainer}
            onPress={() => handlePress(match.UID1, match.UID2, match.First_name, match.Main_image_url, match.Chat_id, match.url1)} 
            >
            <View style={styles.imageContainer}>
              <Image 
                //source={match.img} 
                source={{ uri: match.url1}} //HARDCODED IMG
                style = {styles.matchImage}
              />
            </View>
            
            {/*  Matches Name */}
            <Text 
              style = {styles.matchName}
            >
              {match.First_name}
            </Text>

            </TouchableOpacity>
          );
        })}

      
      </ScrollView>
        
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(1),
    

  },
  scrollViewContent: {
    paddingLeft: wp(0),
  },
  matchContainer: {
    alignItems: 'center',
    marginRight: wp(1), 
  
    width: wp(25),
  },
  imageContainer: {
    borderRadius: hp(3), 
    
  },
  matchImage: {
    width: hp(10),
    height: hp(10),
    borderRadius: hp(1), 
  },
  matchName: {
    color: '#1A202C', 
    fontWeight: 'bold',
    fontSize: hp(1.5),
    marginTop: hp(1), 
  },
});