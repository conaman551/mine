import React, { useState, useEffect, useRef } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';

const API_URL = localAddress

function Gender({ route }) {
    const userId = route.params.userId;
    const navigation = useNavigation();
    const [selectedGender, setSelectedGender] = useState(null);

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.45,
                    duration: 1500,
                    useNativeDriver: false,
                })
            ).start();
        };
    
        startAnimation();
    }, []);

    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
    };

    const handleSubmit = async () => {
        const data = { 
            uid : userId,
            gender: selectedGender 
        };
        console.log(selectedGender); // For testing purposes, remove in production

        try{
            const response = await fetch(`${API_URL}/users/submit-gender`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if(response.ok){
                navigation.navigate('Preference', {userId : userId});
            }
            else{
                console.log('Try again')
            }
        }
        catch(error){
            console.log('Error', error);
        }
    };

    const handleNextPress = () => {
        if (selectedGender) {
            handleSubmit();
        }
    };

    const getCenterImage = () => {
        switch (selectedGender) {
            case 'Male':
                return require('../assets/man.png');
            case 'Female':
                return require('../assets/woman.png');
            case 'Other':
                return require('../assets/lgbt.png');
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Name', {userId : userId})}
            >
                <Icon name="arrow-back" size={45} color="#BD7CFF" />
            </TouchableOpacity>

            <Image source={require('../assets/mine-logo.png')} style={styles.logo} resizeMode="contain" />

            <View style={styles.divider} />
            <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.45 }]} />
            <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />

            <Text style={styles.title}>What's your gender?</Text>

            <View style={styles.triangleContainer}>
                <View
                    style={[
                        styles.dottedLine,
                        styles.maleLine,
                        selectedGender === 'Male' && styles.solidLine,
                    ]}
                />
                <View
                    style={[
                        styles.dottedLine,
                        styles.femaleLine,
                        selectedGender === 'Female' && styles.solidLine,
                    ]}
                />
                <View
                    style={[
                        styles.dottedLine,
                        styles.otherLine,
                        selectedGender === 'Other' && styles.solidLine,
                    ]}
                />

                <View style={styles.centerCircle}>
                    {selectedGender && (
                        <Image
                            source={getCenterImage()}
                            style={styles.centerIcon}
                            resizeMode="contain"
                        />
                    )}
                </View>

                <Text style={[styles.labelText, styles.maleLabel]}>Female</Text>
                <TouchableOpacity
                    style={[styles.genderCircle, styles.malePosition]}
                    onPress={() => handleGenderSelect('Male')}
                >
                    <Image
                        source={require('../assets/male.png')}
                        style={styles.genderIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <Text style={[styles.labelText, styles.femaleLabel]}>Male</Text>
                <TouchableOpacity
                    style={[styles.genderCircle, styles.femalePosition]}
                    onPress={() => handleGenderSelect('Female')}
                >
                    <Image
                        source={require('../assets/female.png')}
                        style={styles.genderIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.genderCircle, styles.otherPosition]}
                    onPress={() => handleGenderSelect('Other')}
                >
                    <Image
                        source={require('../assets/other.png')}
                        style={styles.genderIcon}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={[styles.labelText, styles.otherLabel]}>Other</Text>
            </View>

            <TouchableOpacity
                style={[styles.nextButton, !selectedGender && styles.disabledButton]}
                onPress={handleNextPress}
                disabled={!selectedGender}
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
        width: wp(45), 
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
        marginTop: hp(5),
        fontSize: wp(7),
        color: '#000',
        textAlign: 'center',
    },
    triangleContainer: {
        marginTop: hp(-4),
        width: wp(80),
        height: hp(58.1),
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerCircle: {
        width: wp(29),
        height: wp(29),
        borderRadius: wp(15),
        borderWidth: wp(0.7),
        borderColor: '#BD7CFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        backgroundColor: '#FFF',
    },
    centerIcon: {
        width: wp(22),
    },
    genderCircle: {
        position: 'absolute',
        width: wp(21.7),
        height: wp(21.7),
        borderRadius: wp(50),
        borderWidth: wp(0.5),
        borderColor: '#BD7CFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        backgroundColor: '#FFF',
    },
    malePosition: {
        top: hp(11.6),
        right: wp(0),
    },
    femalePosition: {
        top: hp(11.6),
        left: wp(0),
    },
    otherPosition: {
        bottom: hp(5.8),
        alignSelf: 'center',
    },
    genderIcon: {
        width: wp(13),
        height: wp(13),
    },
    maleLine: {
        width: wp(24),
        top: hp(23.6),
        right: wp(14.7),
        transform: [{ rotate: '-45deg' }],
    },
    femaleLine: {
        width: wp(24),
        top: hp(23.6),
        left: wp(14.7),
        transform: [{ rotate: '45deg' }],
    },
    otherLine: {
        width: hp(11.1),
        bottom: hp(21),
        alignSelf: 'center',
        transform: [{ rotate: '90deg' }],
    },
    solidLine: {
        borderStyle: 'solid',
        borderWidth: wp(0.7), 
        borderColor: '#BD7CFF',
        backgroundColor: '#BD7CFF',
    },
    dottedLine: {
        position: 'absolute',
        borderStyle: 'dotted',
        borderWidth: wp(0.4),
        borderColor: '#BD7CFF',
        zIndex: 1,
        borderDashArray: [wp(0.5), wp(1.5)],
    },
    labelText: {
        fontSize: wp(4),
        color: '#BD7CFF',
        position: 'absolute',
    },
    femaleLabel: {
        left: wp(65),
        top: hp(22),
    },
    maleLabel: {
        left: wp(4),
        top: hp(22),
    },
    otherLabel: {
        left: wp(35),
        bottom: hp(3),
    },
    nextButton: {
        marginTop: hp(0),
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
    disabledButton: {
        backgroundColor: '#D3D3D3',
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

export default Gender;
