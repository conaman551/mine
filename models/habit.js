import React, { useState, useEffect, useRef } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';

const API_URL = localAddress

function Habit({ route }) {
    const userId = route.params.userId;
    const navigation = useNavigation();
    
    const [drinking, setDrinking] = useState('');
    const [smoking, setSmoking] = useState('');

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.90,
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
    
    const handleSubmit = async () => {
        const data = {
            uid : userId,
            drinking: drinking,
            smoking: smoking
        };
        console.log(drinking) //To remove
        console.log(smoking) //To remove
        try{
            const response = await fetch(`${API_URL}/users/submit-preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if(response.ok){
                navigation.navigate('Confirm', {userId : userId});
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
                    onPress={() => navigation.navigate('Userlocation', {userId : userId})} 
                >
                    <Icon name="arrow-back" size={45} color="#BD7CFF" />
                </TouchableOpacity>
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.90 }]} />
                <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
                
                <Text style={styles.subtitle}>Lifestyle & Habits</Text>

                <Text style={styles.subheading}>Drinking</Text>
                <View style={styles.buttonGroup}>
                    {['Yes I drink', 'I drink sometimes', 'I rarely drink', "No I don't drink", 'Prefer not to say'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.optionButton, drinking === option && styles.selectedButton]}
                            onPress={() => setDrinking(option)}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.subheading}>Smoking</Text>
                <View style={styles.buttonGroup}>
                    {['Yes I smoke', 'I smoke sometimes', "I'm trying to quit", "No I don't smoke", 'Prefer not to say'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.optionButton, smoking === option && styles.selectedButton]}
                            onPress={() => setSmoking(option)}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Next</Text>
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
        width: wp(90), 
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
    subtitle: {
        marginTop: hp(2.5),
        fontSize: wp(7),
        color: '#000',
        textAlign: 'center',
    },
    subheading: {
        fontSize: wp(5),
        color: '#000',
        marginTop: hp(3),
        marginBottom: hp(1),
    },
    buttonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: wp(2.5),
        marginVertical: hp(1.2),
        width: '90%',
    },
    optionButton: {
        paddingVertical: hp(1.1),
        paddingHorizontal: wp(4),
        borderWidth: 1,
        borderColor: '#BD7CFF',
        borderRadius: 10,
        marginBottom: hp(1.1),
        marginRight: wp(2.1),
    },
    optionText: {
        color: '#000',
        fontSize: wp(3.4),
    },
    selectedButton: {
        backgroundColor: '#BD7CFF',
    },
    submitButton: {
        marginTop: hp(0.5),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(13),
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
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

export default Habit;



