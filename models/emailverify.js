import React, { useState, useEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Animated, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = localAddress

function Emailverify({ route }) {
    const email = route.params.email;
    const navigation = useNavigation();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const invisibleInputRef = useRef(null);

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    const startAnimation = () => {
        loadingAnimation.setValue(0);
        Animated.loop(
            Animated.timing(loadingAnimation, {
                toValue: screenWidth * 0.18,
                duration: 1500,
                useNativeDriver: false,
            })
        ).start();
    };

    useEffect(() => {
        
    
        startAnimation();
    }, []);

    useEffect(() => {
        invisibleInputRef.current?.focus();
    }, []);

    const handleFocus = () => {
        invisibleInputRef.current?.focus();
    };

    const handleChange = (text) => {
        const newCode = text.split('').slice(0, 5);
        setCode(newCode.concat(new Array(5 - newCode.length).fill('')));

        const firstEmptyIndex = newCode.findIndex(digit => digit === '');
        if (firstEmptyIndex !== -1) {
            inputRefs.current[firstEmptyIndex]?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.nativeEvent.key === 'Backspace') {
            const newCode = [...code];
            const firstEmptyIndex = newCode.findIndex(digit => digit === '');
            const deleteIndex = firstEmptyIndex === -1 ? 5 : firstEmptyIndex - 1;

            if (deleteIndex >= 0) {
                newCode[deleteIndex] = '';
                setCode(newCode);
            }
        }
    };

    const isCodeComplete = code.every(digit => digit !== '');

    const handleSubmit = async () => {
        startAnimation();
        if (isCodeComplete) {
            const verificationCode = code.join('');
            const payload = {
                email : email,
                code : verificationCode
            }
            console.log(verificationCode) //To remove
            try{
                const response = await fetch(`${API_URL}/auth/emailVerify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                })
                if (response.ok){
                 //   console.log('email verified')
                    const resp = await response.json()
                    console.log(resp)
                    if (resp.message === 'correct') {
                       //store user token and userid here
                       AsyncStorage.setItem("userToken", resp.token); 
                       AsyncStorage.setItem("UID", String(resp.UID));  //Make into string
                       if (!resp.existingUser) { //Reversed for testing
                        navigation.navigate('HomeTabs', {userIdLogin : resp.UID})
                       }
                       else {
                        navigation.navigate('Name', {userId :  resp.UID});
                      //  navigation.navigate('Password', {userId : resp.uid}); //Removed password requirement for now
                       }
                    }
                    else if (resp.message === 'wrong code') {
                         console.log('wrong code')
                    }
                    else if (resp.message === 'timed out') {
                      console.log('timed out')
                    }
                    else {

                    }
                    
                }
                else{
                    console.log('Try again')
                }
            }
            catch(error){
                console.log('Error', error);
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handleFocus}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Email')} 
                >
                    <Icon name="arrow-back" size={45} color="#BD7CFF" />
                </TouchableOpacity>
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.18 }]} />
                <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
                <Text style={styles.promptText}>Verify your email address</Text>
                <Text style={styles.instructionText}>Enter the code from your email{'\n'}we sent you</Text>

                <View style={styles.inputContainer}>
                    {code.map((digit, index) => (
                        <TouchableOpacity 
                            key={index} 
                            onPress={handleFocus} 
                            activeOpacity={1}
                        >
                            <View style={styles.inputBox}>
                                <Text style={styles.inputText}>{digit || '-'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={styles.invisibleInput}
                    value={code.join('')}
                    onChangeText={handleChange}
                    onKeyPress={handleKeyPress}
                    keyboardType="number-pad"
                    maxLength={5}
                    ref={invisibleInputRef}
                    
                />

                <TouchableOpacity 
                    style={[styles.submitButton, isCodeComplete ? styles.activeButton : styles.disabledButton]}
                    disabled={!isCodeComplete}
                    onPress={()=>{handleSubmit()}}
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
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
        width: wp(18), 
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
    promptText: {
        marginTop: hp(8),
        fontSize: wp(7),
        color: '#000',
    },
    instructionText: {
        marginTop: hp(3.3),
        fontSize: wp(3.5),
        color: '#888888',
        textAlign: 'center',
        width: wp(80),
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp(5.7),
        width: wp(90),  
    },
    inputBox: {
        width: wp(12.1),
        height: hp(5.6),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(1.3),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    inputText: {
        fontSize: wp(4.5),
        color: '#000',
    },
    invisibleInput: {
        position: 'absolute',
        opacity: 1,
    },
    submitButton: {
        marginTop: hp(5.6),
        width: wp(80),
        height: hp(6),
        borderRadius: wp(13),
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#BD7CFF',
    },
    disabledButton: {
        backgroundColor: '#E8D1FF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    bottomLinesContainer: {
        justifyContent : "flex-end",
        width: '100%',
        marginTop: hp(30),
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

export default Emailverify;
