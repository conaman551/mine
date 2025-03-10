import React, { useState,useEffect } from 'react';
import { Image, View, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';

const API_URL = localAddress

//const API_URL = 'http://localhost:5000'; //To change

function Login({ navigation }) { 
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleSignIn = async () => {
        try {
            const response = await fetch(`${localAddress}/users/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: number,
                    password: password,
                }),
            });
    
            // Check if the response is actually JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json(); // Parse response
                if (response.ok) {
                    // If login is successful, navigate to HomeTabs and pass the user ID
                    console.log('uid:', data.uid);
                    navigation.navigate('HomeTabs', { userIdLogin: data.uid });
                } else {
                    setIsError(true);
                    setMessage(data.message || "Login failed");
                }
            } else {
                const text = await response.text(); // Get text response (likely HTML)
                console.log('Non-JSON response received:', text);
                setIsError(true);
                setMessage('Unexpected response from server.');
            } 
        } catch (error) {
            console.error('Error:', error);
            setIsError(true);
            setMessage('An error occurred. Please try again.');
        }
    };
    
    

    const getMessage = () => {
        const status = isError ? 'Error: ' : 'Success: ';
        return status + message;
    };
           
    


    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Landing')} 
                >
                    <Icon name="arrow-back" size={45} color="#BD7CFF" />
                </TouchableOpacity>

                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <View style={styles.divider2} />

                <Text style={styles.welcomeText}>Welcome back!</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile number/Email</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={setNumber}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="********"
                        placeholderTextColor="#aaa"
                        secureTextEntry={true}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                    <Text style={styles.signInButtonText}>Sign in</Text>
                </TouchableOpacity>

                <View style={styles.bottomLinesContainer}>
                    <View style={styles.bottomDivider} />
                    <View style={styles.bottomDivider2} />
                </View>
                
                {message ? (
                    <Text style={[styles.message, { color: isError ? 'red' : 'green' }]} >
                        {getMessage()}
                    </Text>
                ) : null}
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
    divider2: {
        width: '100%',
        height: hp(0.6), 
        backgroundColor: '#E8D1FF',
        marginVertical: hp(0.9),
    },
    welcomeText: {
        marginTop: hp(8),
        fontSize: hp(5),
        color: '#000',
        marginBottom: hp(3),
    },
    inputContainer: {
        width: wp(80),
        marginTop: hp(4.5),
    },
    label: {
        fontSize: hp(2.5),
        fontWeight: '500',
        marginBottom: hp(0.5),
        color: '#000',
    },
    input: {
        height: hp(7.7),
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: wp(2.5),
        fontSize: hp(2),
        backgroundColor: '#F8F8F8',
    },
    forgotPasswordContainer: {
        marginTop: hp(1.5),
        alignItems: 'center',
    },
    forgotPasswordText: {
        fontSize: hp(1.7),
        color: '#A2A2A2',
        fontFamily: 'Courier',
        fontStyle: 'italic',
    },
    signInButton: {
        marginTop: hp(10.2),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#E8D1FF',
        borderRadius: wp(13),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    signInButtonText: {
        color: '#000000',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    bottomLinesContainer: {
        justifyContent : "flex-end",
        width: wp(100),
        marginTop: hp(4),
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
    message: {
        fontSize: 16,
        marginTop: 10,
    },
});

export default Login;
