import { ActivityIndicator, View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import TopBar from '../template/TopBar';
//import { chatData } from "../constants";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import iceSpiceTemp from '../assets/icespicetemp.png'
import MaybeBioScreen from './MaybeBioScreen';

export default function MaybeScreen2({userId}){
    const navigation = useNavigation();
    const MaybeLimit = 6;

    const [maybeData, setMaybeData] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleUserRemoval = (user) => {
        setMaybeData(prevList => prevList.filter(item => item.UID !== user.UID));
      };
    
      const fetchMaybeData = () => {
        fetch(`${localAddress}/users/${userId}/maybe-list/`)
            .then(response => response.json())
            .then(data => {
                const fetchUserDetails = data.map(maybeUser =>
                    fetch(`${localAddress}/users/${maybeUser.UID}/`)
                        .then(response => response.json())
                        .catch(error => {
                            console.error(`Error fetching details for user ${maybeUser.UID}:`, error);
                            return null; // Handle fetch errors gracefully
                        })
                );

                return Promise.all(fetchUserDetails);
            })
            .then(fullUserData => {
                const validUserData = fullUserData.filter(user => user !== null);
                setMaybeData(validUserData); // Set maybe data with fetched users
                setLoading(false); // Stop loading
            })
            .catch(error => {
                console.error('Error fetching maybe list:', error);
                setLoading(false);
            });
    };


    // useFocusEffect to fetch the list whenever screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchMaybeData();
        }, [userId])
    );

    // Display loading spinner while fetching data
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const maybeDataSliced = maybeData.slice(0,6)
    const MaybesUsed = maybeDataSliced.length;
    //////////////end of fetching maybeData/////////





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




    const handleNoPress = () => {
        setShowProfile(false);
    };


    const handleLikePress = () => {
        setShowProfile(false);
    };

    // Open HomeBioScreen
    const handleProfilePress = (user) => {
        setCurrentUser(user);
        setShowProfile(true);
    };

    // Close HomeBioScreen
    const handleCloseProfile = () => {
        setShowProfile(false);
        fetchMaybeData();
    };

    return(
        <View style={{ flex: 1, }}>
            {!showProfile && ( <TopBar/> )}
            {showProfile ? (
                // Display HomeBioScreen if showProfile is true
                <MaybeBioScreen
                loggedInUserId={userId}
                user={currentUser}
                onClose={handleCloseProfile}
                onNoPress={handleNoPress}
                onLikePress={handleLikePress}
                onRemoveUser={handleUserRemoval}
                />
            ) : (
                <>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    Maybe?
                </Text>
                <Text style={styles.headerMaybeTotal}>
                    {MaybesUsed}/{MaybeLimit}
                </Text>
            </View>

            <FlatList
                data={maybeDataSliced.reverse()}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}  // Makes sure there are two items per row
                columnWrapperStyle={styles.row}  // Apply styles for each row
                contentContainerStyle={styles.flatListContent}  // Apply padding to the grid
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(20),
    },
    headerText: {
        fontSize: 35,
        fontWeight: 'bold',
    },
    headerMaybeTotal: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#BD7CFF',
    },
    flatListContent: {
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
        //alignItems: 'center',
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
