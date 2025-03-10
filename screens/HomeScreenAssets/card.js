import React, { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Text, View, Image, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import iceSpiceTemp from '../../assets/icespicetemp.png'
import { localAddress } from '../../constants';

export default function Card({user}) {
  //console.log("sdsdf1", user);
  //const { First_name, UID} = user;

  


  const [modalImage, setModalImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); 
  
  const handleImagePress = (imageUser) => {
    setSelectedImage(imageUser);
    setModalImage(true);
  };

  const closeImageModal = () => {
    setModalImage(false);
    setSelectedImage(null);
  };

  const userId = user.UID;
  console.log("cardtesting", user.UID);

  

  return (
    <View  style={styles.card} >

      <Modal
        visible={modalImage}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={closeImageModal}>
            <Image style={styles.modalImage} source={{uri: selectedImage}} />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Top section with a 2x2 grid of images */}
      <View style={styles.squaresContainer}>
        <View style={styles.row}>
            <TouchableOpacity style={styles.square} onPress={() => handleImagePress(user.url1)}>
              <Image style={styles.image} source={{uri: user.url1}} />
              {/* <Image style={styles.image} source={iceSpiceTemp} /> */}
                <View style={styles.categoriesButton} >
                  <Text style={styles.categoriesButtonText}>
                      {user.Category_1_id}
                  </Text>
                </View>
            </TouchableOpacity>


            <TouchableOpacity style={styles.square} onPress={() => handleImagePress(user.url2)}>
              <Image style={styles.image} source={{uri: user.url2}} />
              {/* <Image style={styles.image} source={iceSpiceTemp} /> */}
                <View style={styles.categoriesButton}  >
                    <Text style={styles.categoriesButtonText}>
                    {user.Category_2_id}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.square} onPress={() => handleImagePress(user.url3)}>
              <Image style={styles.image} source={{uri: user.url3}} />
              {/* <Image style={styles.image} source={iceSpiceTemp} /> */}
                <View style={styles.categoriesButton} >
                    <Text style={styles.categoriesButtonText}>
                    {user.Category_3_id}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.square} onPress={() => handleImagePress(user.url4)}>
              <Image style={styles.image} source={{uri: user.url4}} />
              {/* <Image style={styles.image} source={iceSpiceTemp} /> */}
                <View style={styles.categoriesButton}  >
                    <Text style={styles.categoriesButtonText}>
                    {user.Category_4_id}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    </View>







      

      {/* Bottom section for the rectangular text area */}
      <View style={styles.cardInner}>
        <Text style={styles.name}>{user.First_name} {user.age}</Text> 
        <Text style={styles.distance}>{user.distance} km away</Text> 
      </View> 
    </View>
  );      
};


/* // Dynamically get the screen width for responsiveness
const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width * 0.8) / 2.2; // Shrink further by using 80% of the width and adding padding */

const styles = StyleSheet.create({
  card: {
    width: wp(100), // Adjusts the card width to 90% of screen width
    height: 'auto', // Adjusts the card height to 62% of screen height
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    //alignSelf: 'flex-start', // Centers content horizontally
    marginLeft: wp(-5), // Adds margin to the left of the card
    padding: '0',
  },

  squaresContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%', // Full width of the card
    height: 'auto', // Full height of the card
    //padding: wp(2), // Optional padding around the grid for better spacing
    paddingTop: wp(2), 
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center', // Centers items in each row
    width: '100%', // Full width for each row
  },
  square: {
    width: wp(45), // 48% of the card width to allow some spacing
    height: wp(45), // 48% of the card height to allow some spacing
    //backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    margin: wp(1), // Adds space between squares
    borderRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  categoriesButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoriesButtonText: {
    color: '#FFF',
    fontSize: 12,
  },
  

  // 2x2 grid container
 /*  squaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '80%', // Adjust this to fit all four images properly
    paddingHorizontal: 5, // Add padding to center the images
    
  }, */

  // Individual image box in the grid
  /* image: {
    width: wp(40), // Reduce the size to make sure 4 images fit
    height: wp(40), // Keep it square
    borderRadius: 10,
    margin: 5, // Add margin to create space between the images
  }, */

  // Text section (rectangle)
  cardInner: {
    width: '100%',
    padding: wp(5), // Adds space inside
    justifyContent: 'center', // Centers the text vertically
    alignItems: 'flex-start',  // Centers the text horizontally
  },

  name: {
    fontSize: wp(10),
    color: 'black',
    fontWeight: 'bold',
  },

  distance: {
    fontSize: wp(5),
    color: '#878787',
    lineHeight: 22,
    paddingTop: wp(2),
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

