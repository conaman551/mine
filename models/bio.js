import React, { useState, useEffect, useRef,useContext } from 'react';
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import { AuthContext } from "../context/AuthContext";

const API_URL = localAddress

function Bio() {
    const { saveLoading,userToken,saveRegScreen } = useContext(AuthContext); //change to getFirstName
    const navigation = useNavigation();
    const [bio, setBio] = useState('');
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        saveLoading(false);
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.81,
                    duration: 1500,
                    useNativeDriver: false,
                })
            ).start();
        };
    
        startAnimation();
    }, []);
    
    const handleSubmit = async () => {
        saveLoading(true);
        const data = {
            bio : bio
        };
        console.log(bio) //To remove
        try{
            const response = await fetch(`${API_URL}/users/submit-bio`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer " + userToken
                },
                body: JSON.stringify(data),
            })
            if(response.ok){
                saveRegScreen(6);
                navigation.navigate('Habit');
            }
            else{
                console.log('Try again')
                saveLoading(false);
            }
        }
        catch(error){
            console.log('Error', error);
            saveLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Userlocation')} 
                >
                    <Icon name="arrow-back" size={45} color="#BD7CFF" />
                </TouchableOpacity>
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.81 }]} />
                <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />

                <Text style={styles.title}>Tell us about yourself</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Write your bio here..."
                    placeholderTextColor="#aaa"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    maxLength={300} 
                />
                <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
                <View style={styles.bottomLinesContainer}>
                    <View style={styles.bottomDivider} />
                    <View style={styles.bottomDivider2} />
                </View>
            </View>
        </TouchableWithoutFeedback>
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
        width: wp(81), 
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
    input: {
        height: hp(15),
        width: wp(80),
        borderColor: '#BD7CFF',
        borderWidth: 1,
        borderRadius: 10,
        padding: wp(2.5),
        textAlignVertical: 'top',
        marginTop: hp(5),
    },
    nextButton: {
        marginTop: hp(30.2),
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

export default Bio;
