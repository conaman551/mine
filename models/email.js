import React, { useState, useEffect, useRef,useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Animated, Dimensions, ActivityIndicator} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import { AuthContext } from "../context/AuthContext";


const API_URL = localAddress

function Email({ route }) {
    //const userId = route.params.userId;
    const navigation = useNavigation();
    const [emailAddress, setEmailAddress] = useState('');  
    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    const { saveLoading } = useContext(AuthContext); //change to getFirstName
    const startAnimation = () => {
        loadingAnimation.setValue(0);
        Animated.loop(
            Animated.timing(loadingAnimation, {
                toValue: screenWidth * 0.09,
                duration: 1500,
                useNativeDriver: false,
            })
        ).start();
    };

    useEffect(() => {
        
       // saveLoading(true);
        startAnimation();
    }, []);

    const handleVerify = async () => {
        saveLoading(true);
        const payload = {
          //  uid : userId,
            email: emailAddress,
        };
        console.log(emailAddress) //To remove
        try{
            const response = await fetch(`${API_URL}/auth/requestVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            if (response.ok){
                console.log('ok response',response)
                //Let user know if should use apple or google
                navigation.navigate('Emailverify',{email:emailAddress});
            }
            else{
                console.log(response)
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
            <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.09 }]} />
            <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
            <Text style={styles.promptText}>Enter your email address:</Text>
            <Text style={styles.infoText}>We never share this with anyone and it won't be on your profile.</Text>
            <View style={styles.emailInputContainer}>
                <TextInput 
                    style={styles.input} 
                    keyboardType="email-address"
                    placeholder="Email Address"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    autoFocus={true}
                />
            </View>
            <TouchableOpacity 
                style={styles.verifyButton}
                onPress={()=>{handleVerify()}}>
                <Text style={styles.verifyButtonText}>Verify</Text>
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
    promptText: {
        marginTop: hp(8),
        fontSize: wp(7),
        color: '#000',
    },
    infoText: {
        marginTop: hp(3.3),
        fontSize: wp(3.5),
        color: '#888888',
        textAlign: 'center',
        width: wp(80),
    },
    emailInputContainer: {
        flexDirection: 'row',
        marginTop: hp(5.8),
        width: wp(80),
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: hp(6),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2),
        paddingHorizontal: wp(2.4),
        backgroundColor: '#F8F8F8',
        width: wp(85), 
    },
    verifyButton: {
        marginTop: hp(6),
        width: wp(80),
        height: hp(6),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(13),
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: wp(4),
        fontWeight: 'bold',
    },
    bottomLinesContainer: {
        justifyContent : "flex-end",
        width: '100%',
        marginTop: hp(29),
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

export default Email;
