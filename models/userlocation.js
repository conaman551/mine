import React, { useState, useEffect, useRef,useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import { AuthContext } from "../context/AuthContext";

const API_URL = localAddress

function Userlocation({}) {
    const { saveLoading,userToken,saveRegScreen } = useContext(AuthContext); //change to getFirstName
    const navigation = useNavigation();
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        saveLoading(false)
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.72,
                    duration: 1500,
                    useNativeDriver: false,
                })
            ).start();
        };
    
        startAnimation();
    }, []);

    const enableLocation = async () => {
        setIsFetching(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            setIsFetching(false);
            return;
        }

        try {
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);


            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const { name, street, city, subregion, region, country } = reverseGeocode[0];
                
                const preciseAddress = `${city || subregion}, ${country}`;
                setAddress(preciseAddress);
            }
        } catch (error) {
            setIsFetching(false);
            Alert.alert('Location Error', 'Unable to fetch location. Please try again.');
        } finally {
            setIsFetching(false); 
        }
    };

    const handleSubmit = async () => {
        saveLoading(true)
        const data = {
      
            latitude: location?.latitude,
            longitude: location?.longitude,
        };
        console.log(location?.latitude) //To remove
        console.log(location?.longitude) //To remove
        try{
            const response = await fetch(`${API_URL}/users/submit-address`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + userToken
                },
                body: JSON.stringify(data),
            })
            if(response.ok){
                saveRegScreen(5);
                navigation.navigate('Bio');
            }
            else{
                console.log('Try again')
                saveLoading(false)
            }
        }
        catch(error){
            console.log('Error', error);
            saveLoading(false)
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Photo')} 
            >
                <Icon name="arrow-back" size={45} color="#BD7CFF" />
            </TouchableOpacity>
            <Image 
                source={require("../assets/mine-logo.png")} 
                style={styles.logo} 
                resizeMode="contain" 
            />
            <View style={styles.divider} />
            <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.72 }]} />
            <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
            <Text style={styles.title}>Where are you?</Text>

            {!location && (
                <>
                    <View style={styles.ellipseContainer1}></View> 
                    <View style={styles.ellipseContainer2}></View> 
                    <View style={styles.ellipseContainer3}></View> 

                    <Image 
                        source={require('../assets/location.png')} 
                        style={styles.locationImage} 
                        resizeMode="contain" 
                    />
                    {isFetching && (
                        <Text style={styles.waitText}>Please wait a bit...</Text>
                    )}
                </>
            )}

            {address ? (
                <Text style={styles.addressText}>{address}</Text>
            ) : errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            <TouchableOpacity 
                style={[
                    styles.enableButton, 
                    { marginTop: location !== null ? hp(29.8) : hp(12) }  // Adjust margin based on location
                ]}
                onPress={enableLocation}
            >
                <Text style={styles.enableButtonText}>Enable Location</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleSubmit}
            >
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
            <View style={styles.bottomLinesContainer}>
                <View style={styles.bottomDivider} />
                <View style={styles.bottomDivider2} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center', 
        paddingTop : hp(3),
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        position: 'absolute',
        top: hp(6.5), 
        left: wp(4.5),
        backgroundColor: '#FFFFFF', 
        borderRadius: wp(50),
        zIndex: 1, 
    },
    logo: {
        width: wp(24.4),
        height: hp(12),
        marginTop :hp(-0.3),
    },
    divider: {
        marginTop :hp(-2),
        width: '100%',
        height: hp(0.6), 
        backgroundColor: '#E8D1FF',
    },
    lighterDivider: {
        height: hp(0.6),
        alignSelf: 'flex-start',
        backgroundColor: '#F3E6FF', 
        width: wp(72), 
        marginVertical: hp(0.9), 
        zIndex: 1, 
        borderRadius: wp(5),
    },
    divider2: {
        height: hp(0.6),
        backgroundColor: '#E8D1FF',
        marginTop: hp(-1.5),
        alignSelf: 'flex-start',
        borderRadius: wp(5),
        zIndex: 2, 
    },
    title: {
        fontSize: wp(8.5),
        color: '#000',
        marginTop :hp(8),
    },
    ellipseContainer1: {
        position: 'absolute',
        top: hp(43.5),
        width: wp(9),
        height: wp(9),
        borderRadius: wp(50),
        transform: [
        {scaleX: 2}
        ],
        left: wp(45.6),
        zIndex: -1, 
        borderWidth: wp(0.1),
        backgroundColor: '#E8D1FF',
    },
    ellipseContainer2: {
        position: 'absolute',
        top: hp(41),
        width: wp(20),
        height: wp(20),
        borderRadius: wp(50),
        transform: [
        {scaleX: 2}
        ],
        left: wp(40),
        zIndex: -2, 
        borderWidth: wp(0.1),
        backgroundColor: '#F1E5FF',
    },
    ellipseContainer3: {
        position: 'absolute',
        top: hp(38),
        width: wp(35),
        height: wp(35),
        borderRadius: wp(50),
        transform: [
        {scaleX: 2}
        ],
        left: wp(32.5),
        zIndex: -3, 
        borderWidth: wp(0.1),
        backgroundColor: '#F9F1FF',
    },
    locationImage: {
        width: wp(25),
        height: wp(25),
        marginTop: hp(6.2),
        zIndex: 1, 
    },
    waitText: {
        position: 'absolute',
        top: hp(55),
        color: 'grey',
        fontSize: wp(4),
    },
    addressText: {
        position: 'absolute',
        top: hp(40),
        fontSize: wp(6),
        color: '#000',
        textAlign: 'center',
        width: wp(80)
    },
    errorText: {
        color: 'red',
        marginBottom: hp(2),
    },
    enableButton: {
        width: '60%',
        height: hp(5),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(50),
        justifyContent: 'center',
        alignItems: 'center',
    },
    enableButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    nextButton: {
        marginTop: hp(15.5),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(13),
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    bottomLinesContainer: {
        justifyContent : "flex-end",
        width: wp(100),
        marginTop: hp(2.9),
    },
    bottomDivider: {
        width: '100%',
        height: hp(0.6),
        backgroundColor: '#E8D1FF',
        marginVertical: hp(0.9),
    },
    bottomDivider2: {
        width: '100%',
        height: hp(0.6),
        backgroundColor: '#E8D1FF',
    },
});

export default Userlocation;
