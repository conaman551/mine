import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import TopBar from '../template/TopBar';
//import { chatData } from "../constants";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import iceSpiceTemp from '../assets/icespicetemp.png'
import LikeBioScreen from './LikeBioScreen';

export default function LikeScreen2({userId}){
    const navigation = useNavigation();

    //Fetch likeData and Display it//////////////////
    const [likeData, setLikeData] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleUserRemoval = (user) => {
        setLikeData(prevList => prevList.filter(item => item.UID !== user.UID));
      };

    const fetchLikeData = () => {
        // Fetch the initial maybe list
        fetch(`${localAddress}/users/${userId}/liked-list/`)
            .then(response => response.json())
            .then(data => {
                const fetchUserDetails = data.map(likeUser => 
                    fetch(`${localAddress}/users/${likeUser.UID}/`)
                        .then(response => response.json())
                        .catch(error => {
                            console.error(`Error fetching details for user ${likeUser.UID}:`, error);
                            return null; // Handle fetch errors gracefully
                        })
                );

                return Promise.all(fetchUserDetails);
            })
            .then(fullUserData => {
                // Filter out any null responses and update maybeData with complete user data
                const validUserData = fullUserData.filter(user => user !== null);
                setLikeData(validUserData);
                //console.log('Maybe DataXCX:', maybeData);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching liked list:', error);
                setLoading(false);
            });
        };

    // useFocusEffect to fetch the list whenever screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchLikeData();
        }, [userId])
    );

    // Display loading spinner while fetching data
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    //////////////end of fetching likeData/////////




    const renderItem = ({ item }) => (
        <View style={styles.matchWrapper}>
            <TouchableOpacity 
                style={styles.matchContainer}
                onPress={() => handleProfilePress(item)}
            >
                <View style={styles.imageContainer}>
                    <Image 
                        //source={item.imgUrl} 
                        source={{uri: item.url1 }}
                        style={styles.matchImage}
                    />
                </View>
                
                {/*  Matches Name */}
                <Text style={styles.matchName}>{item.First_name}, {item.Age}</Text>
            </TouchableOpacity>
        </View>
    );


    
    // Open HomeBioScreen
    const handleProfilePress = (user) => {
        setCurrentUser(user);
        setShowProfile(true);
    };

    // Close HomeBioScreen
    const handleCloseProfile = () => {
        setShowProfile(false);
    };

    return(
        <View style={{ flex: 1, }}>
            {!showProfile && ( <TopBar/> )}

            {showProfile ? (
                // Display HomeBioScreen if showProfile is true
                <LikeBioScreen
                loggedInUserId={userId}
                user={currentUser}
                onClose={handleCloseProfile}
                onRemoveUser={handleUserRemoval}
                />
            ) : (
                <>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    Liked you!
                </Text>
            </View>
            
            <FlatList
                data={likeData.reverse()}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}  // Makes sure there are two items per row
                columnWrapperStyle={styles.row}  // Apply styles for each row
                contentContainerStyle={styles.scrollViewContent}  // Apply padding to the grid
                showsVerticalScrollIndicator={false}
            />
            </>
            )}
        </View>
    );
}


const styles = StyleSheet.create({

    headerContainer: {
        marginVertical: 20,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 35,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        padding: 10,
    },
    row: {
        justifyContent: 'space-between', // Make sure two items per row are spaced out evenly
        marginBottom: 20,
    },
    matchWrapper: {
        
        marginHorizontal: hp(2),   // Add some margin to space items
        backgroundColor: '#E8D1FF',
        paddingVertical: hp(2),
        borderRadius: 10,
        paddingHorizontal: wp(2),
    },
    matchContainer: {
        alignItems: 'center',
    },
    imageContainer: {
        width: wp(35),   // Adjust width and height as needed
        height: hp(15),
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 5,
    },
    matchImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    matchName: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
