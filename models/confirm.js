import React, { useState, useEffect, useRef,useContext } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import { AuthContext } from "../context/AuthContext";

const API_URL = localAddress;

function Confirm({ route }) {
     const { saveLoading,userID,completeRegistration } = useContext(AuthContext); //change to getFirstName
    const navigation = useNavigation();
    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        saveLoading(false);
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 1,
                    duration: 1500,
                    useNativeDriver: false,
                })
            ).start();
        };
    
        startAnimation();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_URL}/users/${userID}/get-user`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const result = await response.json();
                    setUserData(result);
                    console.log('user data',result)
                } else {
                    console.log('Failed to fetch user data');
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
    
        fetchUserData();
    }, [userID]);
    

    const handleSubmit = async () => {

        saveLoading(true);

        const data = {
            uid : userID,
        };
        try{
            const responseValid = await fetch(`${API_URL}/users/submit-user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (responseValid) {
                completeRegistration();
                
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
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Habit')}
            >
                <Icon name="arrow-back" size={45} color="#BD7CFF" />
            </TouchableOpacity>
            
            <Image 
                source={require("../assets/mine-logo.png")} 
                style={styles.logo} 
                resizeMode="contain" 
            />
            <View style={styles.divider} />
            <Animated.View style={[styles.lighterDivider, { width: screenWidth * 1 }]} />
<Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />

            <Text style={styles.title}>Confirm Your Details</Text>
            <View style={styles.confirm}>
                {userData && (
                    <Text style={styles.detailText}>
                        {userData.Email ? `Email: ${userData.Email}` : `Phone number: ${userData.Phone_number}`}
                    </Text>
                )}

                {userData && (
                    <Text style={styles.detailText}>
                        {`Name: ${userData.First_name} ${userData.Last_name}`}
                    </Text>
                )}


                {userData && (
                    <Text style={styles.detailText}>
                        {`Date of Birth: ${userData.DOB.split('T')[0]}`}
                    </Text>
                )}

                {userData && (
                    <Text style={styles.detailText}>
                        {`Gender: ${userData.Gender}`}
                    </Text>
                )}

                {userData && (
                    <Text style={styles.detailText}>
                        {`Gender Preference: ${userData.Gender_pref}`}
                    </Text>
                )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
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
        paddingTop: hp(3),
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
        marginTop: hp(-0.3),
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
        width: wp(9), 
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
    submitButton: {
        marginTop: hp(11.3),
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
        justifyContent: "flex-end",
        width: wp(100),
        marginTop: hp(3),
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
    confirm: {
        marginTop: hp(10),
        backgroundColor: '#F9F9F9',
        paddingVertical: hp(2),
        paddingHorizontal: wp(4),
        borderRadius: wp(3),
        width: wp(80),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    detailText: {
        marginTop: hp(1.5),
        fontSize: wp(4.5),
        color: '#333',
        textAlign: 'left',
        width: '100%',
        paddingVertical: hp(0.8),
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        fontWeight: '500',
    },
});

export default Confirm;
