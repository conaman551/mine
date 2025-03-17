import React, { useState,useEffect,useContext } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Modal,Button } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Font from 'expo-font';
import { localAddress } from '../constants';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AuthContext } from "../context/AuthContext";


const API_URL = localAddress

function Landing() {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(true);
    const { login, Oauth, completeRegistration, resetRegistrationComplete } = useContext(AuthContext);
    const uri = Linking.createURL() 

    const [fontsLoaded] = Font.useFonts({
        'Quick Love': require('../assets/QuickLove-gxeqP.ttf'),
    });


    const handleSubmit1 = () => {
        navigation.navigate('Number',  {userId : 1});
    };

    const handleSubmit2 = () => {
        navigation.navigate('Email');
    };

    
const googleOauth = async () => {
    console.log('fart')
    console.log(uri)
    //uri)
    const result = await WebBrowser.openAuthSessionAsync(
        `${BASE_URL}/auth/google/?redirect=` + uri, uri
    );
    if (result.type === "success") {
        // get back the params from the url
        const params = Linking.parse(result.url);

        if (params.queryParams.correctlogin === 'true') {
            if (params.queryParams.existingUser === 'true') {
                Oauth(params.queryParams.token)
                completeRegistration()
            }
            else {
                await resetRegistrationComplete();
                Oauth(params.queryParams.token)
            }
        }
        else {
            if (params.queryParams.shoulduse === 'email') {
                Alert.alert("Your email has been used previously with email log in", "Please login via email");
            }
            if (params.queryParams.shoulduse === 'apple') {
                Alert.alert("Your email has been used previously with apple sign in", "Please sign in via apple");
            }
        }

    }
}

    return (
        <View style={styles.container}>
            <Image 
                source={require("../assets/mine-logo.png")} 
                style={styles.logo} 
                resizeMode="contain" 
            />
            <View style={styles.divider} />
            <View style={styles.divider2} />
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Make a</Text>
                <Text style={styles.title}>Match,</Text>
                <Text style={styles.title}>Make you</Text>
                <Text style={styles.title}>Mine</Text>
            </View>

            <View style={styles.explain}>
                <TouchableOpacity style={styles.explanationContainer} onPress={() => setModalVisible(true)}>
                    <Text style={styles.explanationText}>Powered by a free and fair algorithm</Text>
                    <Icon name="information-circle" size={16} color="grey" style={styles.infoIcon} />
                </TouchableOpacity>
            </View>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Image 
                            source={require('../assets/phone.png')} // Add this line
                            style={styles.modalImage} // Add a new style for the image
                            resizeMode="contain" // Ensures the image fits well
                        />
                        <Text style={styles.modalText}>
                            Our free and fair algorithm focuses on finding the best matches for you. We prioritize genuine compatibility over looks. Every match is thoughtfully chosen just for you.
                        </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.button2} onPress={() => { googleOauth() }}>
                    <Image style={{ width: 25, resizeMode: 'contain', marginHorizontal: 5, marginLeft: 30 }} source={require('../assets/google_g.png')} />
                    <Text style={styles.button2Text}>Continue with Google</Text>
            </TouchableOpacity>
        
            <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => {
                    handleSubmit2()}}>
                <Icon name="mail-outline" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.buttonText}>Use email address</Text>
            </TouchableOpacity>
            
            <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.orLine} />
            </View>

            <TouchableOpacity 
                style={styles.thirdButton} 
                onPress={() => navigation.navigate('Login')}>
                <Icon name="person-outline" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.buttonText}>I already have an account</Text>
            </TouchableOpacity>
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
    logo: {
        width: wp(24.4),
        height: hp(12),
        marginTop :hp(-0.3),
    },
    button2: {
        alignItems: "center",
        flexDirection: 'row',
        backgroundColor: '#131314',
        borderRadius: 6,
        height: 47, // Set the buttons height',
        marginTop: 15,
        width: 275,
    },
    button2Text: {
        color: "white",
        fontSize: 17,
        fontWeight: 500
    },
    divider: {
        marginTop :hp(-2),
        width: '100%',
        height: hp(0.6), 
        backgroundColor: '#E8D1FF',
    },
    divider2: {
        width: '100%',
        height: hp(0.6), 
        backgroundColor: '#E8D1FF',
        marginVertical: hp(0.9),
    },
    titleContainer: {
        marginTop: hp(5),
        alignItems: 'flex-start',
        marginLeft: wp(-12),

        elevation: 7,
    },
    title: {
        fontSize: wp(11),
        color: '#FF69B4',
        marginBottom: hp(3),
        marginLeft: wp(13),
        fontFamily: "Quick Love",
        letterSpacing: 2,
        textShadowColor: 'rgba(255, 105, 180, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center',
        backgroundColor: 'transparent',
        textTransform: 'none',
        fontWeight: '600',
    },
    explain: {
        marginTop: hp(1),
    },
    explanationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    explanationText: {
        color: 'grey',
        fontSize: wp(3.8),
        textAlign: 'center',
    },
    infoIcon: {
        marginLeft: wp(1),
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContainer: {
        width: wp(90),
        height: wp(90),
        borderRadius: wp(50), 
        padding: hp(3),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalImage: {
        width: wp(50), 
        height: wp(50),
        marginTop : hp(-3)
    },
    modalText: {
        fontSize: wp(3.5), 
        color: '#444',
        textAlign: 'center',
        marginBottom: hp(2),
        lineHeight: 20,
        paddingHorizontal: hp(2), 
        marginTop : hp(-3)
    },
    closeButton: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        backgroundColor: '#BD7CFF', 
        borderRadius: 20,
        elevation: 3,
    },
    
    closeButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: wp(4.2),
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(5),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(13),
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.1,
        shadowRadius: wp(2),
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: 'bold',
        marginLeft: wp(2),
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(2.3),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(13),
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.1,
        shadowRadius: wp(2),
        elevation: 5,
    },
    thirdButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(2.3),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(13),
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hp(0.5) },
        shadowOpacity: 0.1,
        shadowRadius: wp(2),
        elevation: 5,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(2.3),
        width: wp(80),
        justifyContent: 'center',
    },
    orLine: {
        height: 1,
        backgroundColor: '#BD7CFF',
        flex: 1,
    },
    orText: {
        marginHorizontal: wp(3),
        color: '#BD7CFF',
        fontSize: wp(4),
    },
});

export default Landing;
