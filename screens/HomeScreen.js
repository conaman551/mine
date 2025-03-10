import { ActivityIndicator, View, Text, StyleSheet, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import FlipToggle from 'react-native-flip-toggle-button';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, } from "@react-navigation/native";

import Swiper from 'react-native-deck-swiper';
import Card from './HomeScreenAssets/card'; // Adjust the path if needed
import usersHard from './HomeScreenAssets/users'; // Adjust the path if needed
import HomeBioScreen from './HomeBioScreen'; // Import the new HomeBioScreen component
import { localAddress } from '../constants';




export default function HomeScreen({userId}) {
    const [swipeData, setSwipeData] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state

    const [showFilterModal, setShowFilterModal] = useState(false);
    // Independent state for each slider
    const [isDistanceOn, setIsDistanceOn] = useState(false);
    const [isAgeOn, setIsAgeOn] = useState(false);
    const [distance, setDistance] = useState(50);
    const [ageRange, setAgeRange] = useState([18, 30]); 
    // Store the original state of the sliders when the modal opens
    const originalState = useRef({ distance: isDistanceOn, age: isAgeOn });
    
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showProfile, setShowProfile] = useState(false); // Track whether the profile screen is open
    const swiperRef = useRef(null);
    const [swiperKey, setSwiperKey] = useState(0);
    const [allCardsSwiped, setAllCardsSwiped] = useState(false);
    
    const [swipedCard, setSwipedCard] = useState(null); // State to store the last swiped card
    const [swipedAction, setSwipedAction] = useState(null); // Store the action (like/maybe/dislike)
    const [canRewind, setCanRewind] = useState(true); // Control rewind availability
    const [isMatchModalVisible, setIsMatchModalVisible] = useState(false); // State for the match modal
    const [matchedUser, setMatchedUser] = useState(null);


    useFocusEffect(
        React.useCallback(() => {
            //console.log(`Fetchedered1 ${swipeData} cards`);
          fetch(`${localAddress}/users/${userId}/cards`)
            .then(response => response.json())
            .then(data => {
              if (data && data.length > 0) {
                setSwipeData(data);  // Make sure there are cards
                setCurrentIndex(0);  // Reset the index on data load
                setSwiperKey(prevKey => prevKey + 1);  // Trigger re-render
                setAllCardsSwiped(false);  // Reset flag
                
              } else {
                setAllCardsSwiped(true);  // No cards, set flag
              }
              setLoading(false);  // Stop loading
            })
            .catch(error => {
              console.error(`Error fetching data: ${error}`);
              setLoading(false);  // Stop loading in case of error
            });
        }, [userId])
      );
      

      
    

    // Display loading spinner while fetching data
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    // Open modal and save the original states
    const openFilterModal = () => {
        // Save original state when modal opens
        originalState.current = { distance: isDistanceOn, age: isAgeOn };
        setShowFilterModal(true);
        //setIsMatchModalVisible(true); //temporarily put this here so i can see the match modal. Need to set true when a match occurs.
    };
    // Save the changes made in the modal
    const handleSave = () => {
        setShowFilterModal(false);
    };
    // Revert to the original state if "Cancel" is clicked
    const handleCancel = () => {
        // Reset sliders to their original positions
        setIsDistanceOn(originalState.current.distance);
        setIsAgeOn(originalState.current.age);
        setShowFilterModal(false);
    };


    const currentUser = swipeData && swipeData.length > 0 ? swipeData[currentIndex] : null;
    if (currentUser) {
        console.log("curruser", currentUser.UID);
    }

    // POST and DELETE request functions
    const postAction = async (user, action) => {
        try {
            const response = await fetch(`${localAddress}/users/${userId}/${action}/${user.UID}`, {
                method: 'POST',
            });
    
            if (!response.ok) {
                throw new Error(`Failed to ${action} user`);
            }
    
            const data = await response.json();
            console.log(`User ${user.UID} ${action}d successfully`, data);
    
            // Only check the response type if the action is 'like'
            if (action === 'like' && data.type === 'matched') {
                setMatchedUser(user); // Set the matched user details for the modal
                setIsMatchModalVisible(true); // Show the match modal
            }
    
        } catch (error) {
            console.error(`Error in postAction: ${error.message}`);
        }
    };
    
    /* const deleteAction = async (user, action) => {
        try {
            const response = await fetch(`${localAddress}/users/${userId}/${action}/${user.UID}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`Failed to undo ${action} for user`);
            console.log(`User ${action} undone successfully`);
        } catch (error) {
            console.error(error);
        }
    }; */

    /* const handleRewind = () => {
        if (lastUser && lastAction) {
            deleteAction(lastUser, lastAction); // Undo the last action
            setLastAction(null); // Clear last action after rewinding
            setLastUser(null);
        }
        // Update index and swipe position
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : swipeData.length - 1));
        swiperRef.current.jumpToCardIndex(currentIndex - 1);
    };
    const handleNoPress = () => {
        if (currentUser) {
            postAction(currentUser, 'dislike');
        }
        setShowProfile(false);
        if (swiperRef.current) {
            swiperRef.current.swipeLeft();
        }
    };
    const handleMaybePress = () => {
        if (currentUser) {
            postAction(currentUser, 'maybe');
        }
        setShowProfile(false);
        if (swiperRef.current) {
            swiperRef.current.swipeTop();
        }
    };
    const handleLikePress = () => {
        if (currentUser) {
            postAction(currentUser, 'like');
        }
        setShowProfile(false);
        if (swiperRef.current) {
            swiperRef.current.swipeRight();
        }
    };
    const handleSwipe = () => {
        setCurrentIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            console.log(`Swiped! Current index: ${newIndex}`);
            // Check if there are no more cards left
            if (newIndex >= swipeData.length) {
                setAllCardsSwiped(true); // Set the flag when all cards are swiped
            }
            return newIndex;
        });
    };  */
    const closeMatchModal = () => {
        setIsMatchModalVisible(false);
        setMatchedUser(null); // Reset matched user after closing modal
    };
    
    const handleSwipe = (action) => {
        if (currentUser) {
            postAction(currentUser, action); // Send the action to the backend
          }
      
          if (currentIndex < swipeData.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1); // Go to the next card
        } else {
            setAllCardsSwiped(true); // Mark as all cards swiped
        }
          setSwipedCard(currentUser); // Store the swiped card for potential rewind
          setSwipedAction(action); // Store the action
          setCanRewind(true); // Enable rewinding
      
          

        // Log the card that was just swiped, the current index, and the total number of cards
        console.log(`Swiped card: ${currentUser?.UID}`);
        console.log(`Current index: ${currentIndex + 1}`);
        console.log(`Total cards: ${swipeData.length}`);
        const allCardUIDs = swipeData.map(card => card.UID);
        console.log(`All card UIDs: ${allCardUIDs.join(', ')}`);
    };
    
    
    const handleRewind = () => {
        if (canRewind && swipedCard) {
            // Allow rewinding to the previous card
            setCurrentIndex(prevIndex => prevIndex - 1); // Go back to the previous index
            swiperRef.current.jumpToCardIndex(currentIndex - 1); // Show the previous card
            setCanRewind(false); // Disable rewinding for the same card
        }
    };
    
    const handleNoPress = () => {
        if (currentUser) {
            handleSwipe('dislike');
            setShowProfile(false);
            swiperRef.current.swipeLeft(); // Swiping the card left
        }
    };
    
    const handleMaybePress = () => {
        if (currentUser) {
            handleSwipe('maybe');
            setShowProfile(false);
            swiperRef.current.swipeTop(); // Swiping the card up
        }
    };
    
    const handleLikePress = () => {
        console.log("curruserIN", currentUser.UID);
        if (currentUser) {
            handleSwipe('like');
            setShowProfile(false);
            swiperRef.current.swipeRight(); // Swiping the card right
        }
    };



    // Open HomeBioScreen
    const handleProfilePress = () => {
        setShowProfile(true);
    };
    // Close HomeBioScreen
    const handleCloseProfile = () => {
        setShowProfile(false);
    };
    //Alex part
   

    return (
        
        <View style={{flex:1}}>
            {!showProfile && (
                <View style={styles.container}>
                    {/* Rewind Button */}
                    <TouchableOpacity
                        onPress={() => handleRewind}
                    >
                        <Image 
                            style={styles.iconImage}
                            source={require("../assets/rewind-icon.png")}
                        />
                    </TouchableOpacity>
                    {/* Mine Logo */}
                    <Image 
                        source={require("../assets/mine-logo.png")} 
                        style={styles.logo} 
                        resizeMode="contain" 
                    />
                    {/* Filter button */}
                    <TouchableOpacity 
                        onPress={openFilterModal} 
                    >
                        <Image 
                            style={styles.iconImage}
                            source={require("../assets/filter-icon.png")}
                        />
                    </TouchableOpacity>
                </View>
            )}
            {/* Divider */}
            <View style={styles.divider} />
            <View style={styles.divider2} />
            {/* Filter Modal */} 
            {showFilterModal && (
                <Modal
                    transparent={true}
                    visible={showFilterModal}
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    {/* Backdrop that closes the modal */}
                    <TouchableOpacity
                        style={stylesFilterModal.backDrop}
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)} // Closes modal when clicking outside
                    >
                        {/* Empty view to catch the backdrop press */}
                        <View style={{ flex: 1 }} />
                    </TouchableOpacity>
                    {/* Modal content */}
                    <View style={stylesFilterModal.container}>
                        {/* Header */}
                        <Text style={stylesFilterModal.header}>Sort by:</Text>
                        
                        {/* Distance */}
                        <View style={stylesFilterModal.outerOptionContainer}>
                            <Text style={stylesFilterModal.headerText}>Maximum Distance</Text> 
                            <Text style={stylesFilterModal.distanceText}>{distance} km</Text>
                            
                            {/* Slider to adjust distance */}
                            <MultiSlider
                                values={[distance]} // Use a single value array to get 1 thumb
                                min={1}
                                max={200}
                                step={1}
                                sliderLength={wp(60)} // Slider length matches the distance slider
                                onValuesChange={(value) => setDistance(value[0])}
                                selectedStyle={{
                                    backgroundColor: "#000000", // Matches the minimumTrackTintColor of the Slider
                                }}
                                unselectedStyle={{
                                    backgroundColor: "#635f5f", // Matches the maximumTrackTintColor of the Slider
                                }}
                                markerStyle={{
                                    //height and width not same size as Slider. I guesstimated size. 
                                    //Slider doesn't allow you to change Thumb Size..., so I can only guess Multisliders height and width to match Slider
                                    height: hp(2.5),
                                    width: hp(2.5),
                                    borderRadius: hp(1.5),
                                    backgroundColor: "#000000", 
                                    borderColor: "#000",
                                    //borderWidth: 1,
                                    
                                }}
                            />
                            {/* Toggle Button */}
                            <View style={stylesFilterModal.optionContainer}>
                                    <Text style={stylesFilterModal.optionText}>
                                        Show people slightly out of maximum distance if I run out of matches.
                                    </Text>
                                    <FlipToggle
                                        value={isDistanceOn}
                                        buttonWidth={wp(11)}
                                        buttonHeight={hp(3)}
                                        sliderWidth={hp(2.5)}
                                        sliderHeight={hp(2.5)}
                                        sliderOnColor="#FFFFFF"
                                        sliderOffColor="#FFFFFF"
                                        buttonOnColor="#000000"
                                        buttonOffColor="#635f5f"
                                        sliderRadius={hp(10)}
                                        buttonRadius={hp(10)}
                                        //'margin' property not working??
                                        //margin={wp(200)}
                                        onToggle={(newState) => setIsDistanceOn(newState)}
                                    />
                            </View>
                        </View>
                        {/* Age */}
                        <View style={stylesFilterModal.outerOptionContainer}>
                            <Text style={stylesFilterModal.headerText}>Age Range</Text>
                            <Text style={stylesFilterModal.distanceText}>{ageRange[0]} - {ageRange[1]} years</Text>
                            
                            <MultiSlider
                                values={ageRange}
                                min={18}
                                max={100}
                                step={1}
                                sliderLength={wp(60)} // Slider length matches the distance slider
                                onValuesChange={(values) => {
                                    setAgeRange(values); // Update age range state
                                }}
                                selectedStyle={{
                                    backgroundColor: "#000000", // Matches the minimumTrackTintColor of the Slider
                                }}
                                unselectedStyle={{
                                    backgroundColor: "#635f5f", // Matches the maximumTrackTintColor of the Slider
                                }}
                                markerStyle={{
                                    //height and width not same size as Slider. I guesstimated size. 
                                    //Slider doesn't allow you to change Thumb Size..., so I can only guess Multisliders height and width to match Slider
                                    height: hp(2.5),
                                    width: hp(2.5),
                                    borderRadius: hp(1.5),
                                    backgroundColor: "#000000", 
                                    borderColor: "#000",
                                    //borderWidth: 1,
                                    
                                }}
                            />
                            <View style={stylesFilterModal.optionContainer}>
                                <Text style={stylesFilterModal.optionText}>
                                    Show people slightly outside of age range if I run out of matches.
                                </Text>
                                {/* Toggle Button */}
                                <FlipToggle
                                    value={isAgeOn}
                                    buttonWidth={wp(11)}
                                    buttonHeight={hp(3)}
                                    sliderWidth={hp(2.5)}
                                    sliderHeight={hp(2.5)}
                                    sliderOnColor="#FFFFFF"
                                    sliderOffColor="#FFFFFF"
                                    buttonOnColor="#000000"
                                    buttonOffColor="#635f5f"
                                    sliderRadius={hp(10)}
                                    buttonRadius={hp(10)}
                                    //'margin' property not working??
                                    //margin={wp(200)}
                                    onToggle={(newState) => setIsAgeOn(newState)}
                                />
                            </View>
                        </View>
                        <View style={stylesFilterModal.saveContainer}>
                            <TouchableOpacity onPress={handleSave}>
                                <Text style={stylesFilterModal.closeText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCancel}>
                                <Text style={stylesFilterModal.closeText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Match Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isMatchModalVisible}
                onRequestClose={closeMatchModal}
            >
                <View style={stylesMatchModal.modalContainer}>
                    <View style={stylesMatchModal.modalContent}>
                        <Text style={stylesMatchModal.modalText}>🎉 It's a Match! 🎉</Text>
                        {matchedUser && (
                            <Text style={stylesMatchModal.modalText}>You matched with {matchedUser.First_name}!</Text>
                        )}
                        <TouchableOpacity onPress={closeMatchModal} style={stylesMatchModal.closeButton}>
                            <Text style={stylesMatchModal.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


        {/* ALEX PART */}
        <View style={styles.pageContainer}>
            {showProfile ? (
                // Display HomeBioScreen if showProfile is true
                <HomeBioScreen
                loggedInUserId={userId}
                user={currentUser}
                
                onClose={handleCloseProfile}
                onNoPress={handleNoPress}
                onMaybePress={handleMaybePress}
                onLikePress={handleLikePress}
                />
            ) : (
                <>
               
                {/* Card Swiping Area */}
                {swipeData && (swipeData.length > 0) && (currentIndex < swipeData.length) ? (
                    <View style={styles.swiperArea}>
                        <Swiper
                        ref={swiperRef}
                        cards={swipeData}
                        key={swiperKey}
                        renderCard={(user) => <Card user={user} />}
                        onSwipedLeft={() => handleSwipe('dislike')}  
                        onSwipedRight={() => handleSwipe('like')}    
                        onSwipedTop={() => handleSwipe('maybe')}     
                        onSwiped={() => {}}  
                        cardIndex={currentIndex}
                        stackSize={10}
                        stackSeparation={15}
                        disableBottomSwipe
                        backgroundColor='transparent'
                        />
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>You've run out of cards!</Text>
                    </View>
                )}
                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleSwipe('dislike')}>
                    <Image source={require('../assets/no-button.png')} style={styles.buttonIcon} />
                    </TouchableOpacity>
                    <View style={styles.questionButtonWrapper}>
                    <TouchableOpacity style={styles.topButton} onPress={handleProfilePress}>
                        <Image source={require('../assets/down-arrow-button.png')} style={styles.buttonIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleSwipe('maybe')}>
                        <Image source={require('../assets/maybe-button.png')} style={styles.buttonIcon} />
                    </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => handleSwipe('like')}>
                    <Image source={require('../assets/like-button.png')} style={styles.buttonIcon} />
                    </TouchableOpacity>
                </View>
                </>
            )}
        </View>





        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        height: 130,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: wp(5),
        backgroundColor: '#FFFFFF',
        paddingTop: 28,
    },
    logo: {
        width: 100,
        height: 100,
    },
    divider: {
        marginTop: -15,
        width: '100%',
        height: 5,
        backgroundColor: '#E8D1FF',
    },
    divider2: {
        width: '100%',
        height: 5,
        backgroundColor: '#E8D1FF',
        marginTop: 8,
    },
    iconImage: {
        width: wp(12),
        height: wp(12),
        resizeMode: 'contain',
    },
    //ALEX PART
    pageContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        
      },
      swiperArea: {
        width: '100%',
        height: hp(90),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(-7),
      },
      buttonContainer: {
        position: 'absolute',
        bottom: hp(0), // Adjust this value depending on the height of your bottom navigation bar********
        flexDirection: 'row',
        justifyContent: 'space-around',
        //width: '100%',
        width: wp(120),
        paddingHorizontal: 40,
        paddingBottom: hp(4),
      },
      questionButtonWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      button: {
        width: wp(14),
        height: wp(14),
        backgroundColor: '#fff',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        //shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      topButton: {
        width: wp(14),
        height: wp(14),
        backgroundColor: '#fff',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 75, // Position the top button above the question button
        bottom: hp(17), // Adjust this to position above the "Like" button
        right: wp(-35),
        alignSelf: 'flex-end',
        shadowColor: '#000',
        //shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      buttonIcon: {
        width: wp(14),
        height: wp(14),
        tintColor: '#E8D1FF', // Adjust color if needed
        //padding: wp(10)
        resizeMode: 'contain',
        borderRadius: 30,
        //borderWidth: 33,
      },
      placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        color: '#666',
    },


});
const stylesFilterModal = StyleSheet.create({
    backDrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        position: 'absolute',
        width: wp(80),
        backgroundColor: '#BD7CFF',
        borderRadius: 10,
        alignItems: 'stretch',
        //paddingVertical: hp(2),
        alignSelf: 'center',
        justifyContent: 'center',
        marginVertical: hp(18),
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: hp(4),
        paddingHorizontal: wp(2),
        borderBottomWidth: 5,
        borderBottomColor: '#E8D1FF',
    },
    outerOptionContainer: {
        paddingHorizontal: wp(3),
        alignItems: 'center',
        paddingVertical: hp(2),
        borderBottomWidth: 3,
        borderBottomColor: '#E8D1FF',
    },
    optionContainer: {
        width: '100%',
        paddingHorizontal: wp(2),
        //paddingVertical: hp(2),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 12,
        //textAlign: 'center',
        paddingRight: wp(10),
    },
    closeText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
       // paddingVertical: hp(2.1),
    },
    saveContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(3),
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: hp(1),
    },
    distanceText: {
        fontSize: 16,
        marginBottom: hp(1),
    },
    
});

const stylesMatchModal = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#E8D1FF',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});