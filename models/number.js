import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, Image, Animated, Dimensions  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';

const API_URL = localAddress

function Number({ route }) {
    const userId = route.params.userId;
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState({ name: 'New Zealand', code: '+64', initial: 'NZ' });
    const [mobileNumber, setMobileNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const countries = [
        { name: 'New Zealand', code: '+64', initial: 'NZ' },
        { name: 'Australia', code: '+61', initial: 'AU' },
        { name: 'United States', code: '+1', initial: 'US' },
        { name: 'Nigeria', code: '+234', initial: 'NG' }, 
    ];

    useEffect(() => {
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
    
        startAnimation();
    }, []);

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        closeModal();
    };

    const handleVerify = async () => {
        const payload = {
            uid: userId,
            countryCode: selectedCountry.code,
            mobileNumber: mobileNumber,
        };

        console.log('Payload:', payload);

        try{
            const response = await fetch(`${API_URL}/users/submit-number`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })
            if(response.ok){
                navigation.navigate('Numberverify', {userId : userId});//need change to num verify
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

            <Text style={styles.promptText}>Enter your mobile number:</Text>
            <Text style={styles.infoText}>We never share this with anyone and it won't be on your profile.</Text>
            <View style={styles.phoneInputContainer}>
                <TouchableOpacity style={styles.countryPickerButton} onPress={openModal}>
                    <Text style={styles.countryInitial}>{selectedCountry.initial} {selectedCountry.code}  ▼</Text>
                </TouchableOpacity>
                <TextInput 
                    style={styles.input} 
                    keyboardType="phone-pad"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    autoFocus={true}
                />
            </View>
            <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerify}>
                <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.searchBarContainer}>
                        <TextInput 
                            style={styles.searchBar}
                            placeholder="Search"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity onPress={closeModal}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.countryItem} onPress={() => handleCountrySelect(item)}>
                                <Text style={styles.countryName}>{item.name}</Text>
                                <Text style={styles.countryCode}>{item.code}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
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
    phoneInputContainer: {
        flexDirection: 'row',
        marginTop: hp(5.8),
        width: wp(80),
        alignItems: 'center',
    },
    countryPickerButton: {
        height: hp(6),
        backgroundColor: '#F8F8F8',
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(2.4),
        marginRight: wp(2.4),
        flexDirection: 'row',
    },
    countryInitial: {
        fontSize: wp(3.9),
        color: '#000',
    },
    input: {
        flex: 1,
        height: hp(6),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2),
        paddingHorizontal: wp(2.4),
        backgroundColor: '#F8F8F8',
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingTop: hp(5),
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    searchBar: {
        flex: 1,
        height: hp(4.5),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(2.5),
        backgroundColor: '#F8F8F8',
    },
    cancelText: {
        marginLeft: wp(2.5),
        color: '#BD7CFF',
        fontSize: wp(3.8),
    },
    countryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hp(1.7),
        paddingHorizontal: wp(5),
        borderBottomColor: '#E8D1FF',
        borderBottomWidth: 1,
    },
    countryName: {
        fontSize: wp(3.9),
        color: '#000',
    },
    countryCode: {
        fontSize: wp(3.9),
        color: '#000',
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

export default Number;
