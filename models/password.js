import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, TouchableWithoutFeedback, Keyboard, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';

const API_URL = localAddress

function Password({ route }) {
    const userId = route.params.userId;
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [isMinLength, setIsMinLength] = useState(false);
    const [hasUpperCase, setHasUpperCase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.27,
                    duration: 1500,
                    useNativeDriver: false,
                })
            ).start();
        };
    
        startAnimation();
    }, []);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const validatePassword = (text) => {
        setPassword(text);
        setIsMinLength(text.length >= 8);
        setHasUpperCase(/[A-Z]/.test(text));
        setHasNumber(/\d/.test(text));  // Checks for numbers
    };

    const handleSubmit = async () => {
        const payload = {
            uid : userId,
            password : password
        };

        console.log(password) //To remove
        try{
            const response = await fetch(`${API_URL}/users/submit-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            if (response.ok){
                navigation.navigate('Name', {userId : userId});
            }
            else{
                console.log('Try again')
            }
        }
        catch(error){
            console.log('Error', error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        navigation.setParams({ userId: userId });
                        navigation.goBack()}}
                >
                    <Icon name="arrow-back" size={45} color="#BD7CFF" />
                </TouchableOpacity>
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.27 }]} />
                <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
                <Text style={styles.promptText}>Set your password:</Text>
                
                <TextInput 
                    style={styles.input}
                    secureTextEntry
                    placeholder="Enter password"
                    value={password}
                    onChangeText={validatePassword}
                />

                <View style={styles.checklist}>
                    <View style={styles.checkItem}>
                        <Icon
                            name={isMinLength ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={isMinLength ? "lightgreen" : "red"}
                        />
                        <Text style={styles.checkText}>8+ characters long</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Icon
                            name={hasUpperCase ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={hasUpperCase ? "lightgreen" : "red"}
                        />
                        <Text style={styles.checkText}>Contains uppercase letter</Text>
                    </View>
                    <View style={styles.checkItem}>
                        <Icon
                            name={hasNumber ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={hasNumber ? "lightgreen" : "red"}
                        />
                        <Text style={styles.checkText}>Contains number</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, (!isMinLength || !hasUpperCase || !hasNumber) ? styles.disabledButton : styles.activeButton]}
                    onPress={handleSubmit}
                    disabled={!isMinLength || !hasUpperCase || !hasNumber}
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
        width: wp(27), 
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
        marginTop: hp(6),
        fontSize: wp(7),
        color: '#000',
    },
    input: {
        width: wp(80),
        height: hp(6),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2),
        paddingHorizontal: wp(2.4),
        marginVertical: hp(3),
        backgroundColor: '#F8F8F8',
    },
    checklist: {
        width: wp(80),
        marginTop: wp(4),
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.3),
    },
    checkText: {
        marginLeft: wp(2),
        fontSize: wp(3.9),
        color: '#000',
    },
    submitButton: {
        marginTop: hp(3.3),
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
        marginTop: hp(26.95),
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

export default Password;
