import { ActivityIndicator, View, Text, ScrollView, TouchableOpacity, Image, StyleSheet} from 'react-native'
import React, { useEffect, useState } from 'react'
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { datesData, chatData } from "../constants";
import { useNavigation } from '@react-navigation/native';

export default function Matches({ route }) {
  const navigation = useNavigation();

  



  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {chatData.reverse().map((matches, index) => {
          return (
            <TouchableOpacity 
            key={index}
            style={styles.matchContainer}
            onPress={() => navigation.navigate('ChatDetails', {

              name:matches.name,
              age:matches.age,
              imgUrl:matches.imgUrl,
              chat:matches.chat,
            })}
            >
            <View style={styles.imageContainer}>
              <Image 
                source={matches.imgUrl} 
                style = {styles.matchImage}
              />
            </View>
            
            {/*  Matches Name */}
            <Text 
              style = {styles.matchName}
            >
              {matches.name}
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