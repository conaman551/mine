import React, { useState, useEffect } from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, TouchableWithoutFeedback, Keyboard, FlatList, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import * as ImagePicker from 'expo-image-picker';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import * as Location from 'expo-location';

const API_URL = localAddress;

function Profile({userId}) {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState([null, null, null, null]);
    const [selectedImages, setSelectedImages] = useState([null, null, null, null ]);
    const [profileImage, setProfileImage] = useState(null);
    const [userData, setUserData] = useState(null);
    const [activeSquare, setActiveSquare] = useState(null);
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [genderPreference, setGenderPreference] = useState('');
    const [drinking, setDrinking] = useState('');
    const [smoking, setSmoking] = useState('');
    const [address, setAddress] = useState(null);
    const [isGenderDropdownVisible, setGenderDropdownVisible] = useState(false);
    const [isGenderPreferenceDropdownVisible, setGenderPreferenceDropdownVisible] = useState(false);
    const [isDrinkingDropdownVisible, setDrinkingDropdownVisible] = useState(false);
    const [isSmokingDropdownVisible, setSmokingDropdownVisible] = useState(false);
    
    const genderOptions = ['Male', 'Female', 'Other'];
    const preferenceOptions = ['Male', 'Female', 'Both', 'Other'];
    const [drinkingOptions] = useState(['Yes I drink', 'I drink sometimes', 'I rarely drink', "No I don't drink", 'Prefer not to say']);
    const [smokingOptions] = useState(['Yes I smoke', 'I smoke sometimes', "I'm trying to quit", "No I don't smoke", 'Prefer not to say']);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [termsmodalVisible, setTermsModalVisible] = useState(false);

    const categories = ["Career", "Hobby", "Fav Food", "Family", "Sports", "Travel", "Pet Picture", "Fashion", "Personality", "Social", "Achievement", "Religion", "Wild Card"];
    const [modalVisible2, setModalVisible2] = useState(false);

    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
        setDropdownVisible1(false);
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const result = await response.json();
                    //console.log(result)
                    setUserData(result);
                } else {
                    console.log('Failed to fetch user data');
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
    
        fetchUserData();
    }, [userId]);

    useEffect(() => {
        if (userData) {
            setBio(`${userData.Bio}`);
            setGender(`${userData.Gender}`);
            setGenderPreference(`${userData.Gender_pref}`);
            setDrinking(`${userData.Drinking_tag}`);
            setSmoking(`${userData.Smoking_tag}`);
            setLongitude(`${userData.Longitude}`);
            setLatitude(`${userData.Latitude}`);
            setPhoneNumber(userData.Phone_number ? `${userData.Phone_number}` : "Email used");
            setCountryCode(userData.Country_code ? `${userData.Country_code}` : "");
            setEmail(userData.Email ? `${userData.Email}` : "Phone number used");
            setPassword(`${userData.Password}`);
            setSelectedCategory([
                userData.Category_1_id,
                userData.Category_2_id,
                userData.Category_3_id,
                userData.Category_4_id,
            ]);
            setProfileImage(`${userData.url1}`);   
        }
    }, [userData]);

    const fetchImageAsBase64 = async (url) => {
        if (!url) return null; 
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]); 
                reader.onerror = reject;
                reader.readAsDataURL(blob); 
            });
        } catch (error) {
            console.log('Error fetching image as base64:', error);
            return null;
        }
    };

    const enableLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return;
        }
        try {
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
            setLongitude(currentLocation.coords.longitude);
            setLatitude(currentLocation.coords.latitude);


            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const { name, street, city, subregion, region, country } = reverseGeocode[0];
                
                const preciseAddress = `${city || subregion}, ${country}`;
                setAddress(preciseAddress);
            }
        } catch (error) {
            Alert.alert('Location Error', 'Unable to fetch location. Please try again.');
    }};

    const handleCategorySelect = (category) => {
        const newCategories = [...selectedCategory];
        newCategories[activeSquare] = category;
        setSelectedCategory(newCategories);
        setModalVisible2(false);
    };

    const handleSquarePress = (index) => {
        setActiveSquare(index);
        setModalVisible2(true);
    };

    const renderCategoryButtons = () => {
        return categories.map((category, index) => (
            <TouchableOpacity
                key={index}
                style={styles.categoryButton}
                onPress={() => handleCategorySelect(category)}
            >
                <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
        ));
    };

    const save = async () => {
        console.log(selectedCategory)
        const data1 = {
            uid : userId,
            bio : bio
        };
        const data2 = { 
            uid : userId,
            gender: gender, 
        };
        const data3 = { 
            uid : userId,
            preference: genderPreference 
        };
        const data4 = {
            uid : userId,
            drinking: drinking,
            smoking: smoking
        };
        const data5 = {
            uid : userId,
            latitude: latitude,
            longitude: longitude
        }
        try{
            const response1 = await fetch(`${API_URL}/users/submit-bio`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data1),
            })
            const response2 = await fetch(`${API_URL}/users/submit-gender`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data2),
            })
            const response3 = await fetch(`${API_URL}/users/submit-preference`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data3),
            })
            const response4 = await fetch(`${API_URL}/users/submit-preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data4),
            })
            const response5 = await fetch(`${API_URL}/users/submit-address`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data5),
            })
            for (let i = 1; i <= 4; i++) {
                let data = {
                    data : selectedImages[i-1].base64,
                    filename : `Category_${i}_user_${userId}.jpg`,
                    uid : userId,
                    categoryName : selectedCategory[i-1],
                };
                let response = await fetch(`${API_URL}/images/update_category/${i}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                if (!response.ok) {
                    return;
                    console.log('Try again')
                }
            }
            if(response1.ok && response2.ok && response3.ok && response4.ok && response5.ok){
                setModalVisible(false); 
            }
            else{
                console.log('Try again')
            }
        }
        catch(error){
            console.log('Error', error);
        }
    }

    const save2 = async () => {
        if (phoneNumber=="Email used"){
            const payload1 = {
                uid : userId,
                emailAddress: email,
            };
            const payload3 = {
                uid : userId,
                password : password
            };
            try{
                const response1 = await fetch(`${API_URL}/users/submit-email`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload1),
                })
                const response2 = await fetch(`${API_URL}/users/submit-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload3),
                })
                if (response1.ok && response2.ok){
                    setSettingsModalVisible(false)
                }
                else{
                    console.log('Try again')
                }
            }
            catch(error){
                console.log('Error', error);
            }
        }
        else if (email=="Phone number used"){
            const payload2 = {
                uid: userId,
                countryCode: countryCode,
                mobileNumber: phoneNumber,
            };
            const payload4 = {
                uid : userId,
                password : password
            };
            try{
                const response3 = await fetch(`${API_URL}/users/submit-number`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload2)
                })
                const response4 = await fetch(`${API_URL}/users/submit-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload4),
                })
                if(response3.ok && response4.ok){
                    setSettingsModalVisible(false)
                }
                else{
                    console.log('Try again')
                }
            }
            catch(error){
                console.log('Error', error);
            }
        }
    }

    const delete1 = async () => {
        try{
            const response = await fetch(`${API_URL}/users/delete/${userId}`)
            if (response.ok){
                navigation.navigate('Landing')
            }
            else{
                console.log('Error')
            }
        }
        catch(error){

            console.log('Error', error);
        }
    }


    const openUpdateProfile = () => {
        const fetchImages = async () => {
            const base64Images = await Promise.all([
                fetchImageAsBase64(userData.url1),
                fetchImageAsBase64(userData.url2),
                fetchImageAsBase64(userData.url3),
                fetchImageAsBase64(userData.url4),
            ]);
            const formattedImages = base64Images.map(image => ({ base64: image }));
            setSelectedImages(formattedImages);
        };
        fetchImages();
    };

    // Function to handle image picking
    const handleImageUpload = async (index) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });
        // console.log(result)
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImages = [...selectedImages];
            const base64String = result.assets[0].base64;
            newImages[index] = { base64: base64String };
            setSelectedImages(newImages);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <View style={styles.divider2} />

                <Text style={styles.greeting}>
                    {userData ? `Hi ${userData.First_name}` : 'Loading...'}
                </Text>

                <Image 
                    source={{uri: profileImage}} 
                    style={styles.profileImage} 
                    resizeMode="cover"
                />

                {/* Update Profile Button */}
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Icon name="person-circle-outline" size={24} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>

                {/* Settings Button */}
                <TouchableOpacity style={styles.button} onPress={() => setSettingsModalVisible(true)}>
                    <Icon name="settings-outline" size={24} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>

                {/* Modal for Update Profile */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                    onShow={openUpdateProfile}
                >
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.editProfileTitle}>Edit Profile</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Icon name="close" size={30} color="#000" />
                                </TouchableOpacity>
                                
                                {/* Image Upload and Categories Selection */}
                                <View style={styles.squaresContainer}>
                                    <View style={styles.row}>
                                        <TouchableOpacity 
                                            style={styles.square}
                                            onPress={() => handleImageUpload(0)}
                                        >
                                            {selectedImages[0] ? (
                                                <Image source={{ uri: `data:image/jpeg;base64,${selectedImages[0].base64}` }} style={styles.image} />
                                            ) : (
                                                <Text style={styles.plusText}>+</Text>
                                            )}
                                            <TouchableOpacity 
                                                style={styles.categoriesButton} 
                                                onPress={() => handleSquarePress(0)}
                                            >
                                                <Text style={styles.categoriesButtonText}>
                                                    {selectedCategory[0] ? selectedCategory[0] : "Categories +"}
                                                </Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={styles.square}
                                            onPress={() => handleImageUpload(1)}
                                        >
                                            {selectedImages[1] ? (
                                                <Image source={{ uri: `data:image/jpeg;base64,${selectedImages[1].base64}` }} style={styles.image} />
                                            ) : (
                                                <Text style={styles.plusText}>+</Text>
                                            )}
                                            <TouchableOpacity 
                                                style={styles.categoriesButton} 
                                                onPress={() => handleSquarePress(1)}
                                            >
                                                <Text style={styles.categoriesButtonText}>
                                                    {selectedCategory[1] ? selectedCategory[1] : "Categories +"}
                                                </Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.row}>
                                        <TouchableOpacity 
                                            style={styles.square}
                                            onPress={() => handleImageUpload(2)}
                                        >
                                            {selectedImages[2] ? (
                                                <Image source={{ uri: `data:image/jpeg;base64,${selectedImages[2].base64}` }} style={styles.image} />
                                            ) : (
                                                <Text style={styles.plusText}>+</Text>
                                            )}
                                            <TouchableOpacity 
                                                style={styles.categoriesButton} 
                                                onPress={() => handleSquarePress(2)}
                                            >
                                                <Text style={styles.categoriesButtonText}>
                                                    {selectedCategory[2] ? selectedCategory[2] : "Categories +"}
                                                </Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            style={styles.square}
                                            onPress={() => handleImageUpload(3)}
                                        >
                                            {selectedImages[3] ? (
                                                <Image source={{ uri: `data:image/jpeg;base64,${selectedImages[3].base64}` }} style={styles.image} />
                                            ) : (
                                                <Text style={styles.plusText}>+</Text>
                                            )}
                                            <TouchableOpacity 
                                                style={styles.categoriesButton} 
                                                onPress={() => handleSquarePress(3)}
                                            >
                                                <Text style={styles.categoriesButtonText}>
                                                    {selectedCategory[3] ? selectedCategory[3] : "Categories +"}
                                                </Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={modalVisible2}
                                    onRequestClose={() => setModalVisible2(false)}>
                                        <TouchableWithoutFeedback onPress={() => setModalVisible2(false)}>
                                            <View style={styles.modalContainer2}>
                                                <TouchableWithoutFeedback>
                                                    <View style={styles.modalContent2}>
                                                        <View style={styles.modalHeader2}>
                                                            <Text style={styles.modalArrow2}>↑</Text>
                                                            <Text style={styles.modalTitle2}>Choose a tag</Text>
                                                        </View>
                                                        <ScrollView style={styles.categoriesList}>
                                                            {renderCategoryButtons()}
                                                        </ScrollView>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            </View>
                                        </TouchableWithoutFeedback>
                                </Modal>
                                <View style={styles.divider80} />
                                <Text style={styles.biolabel}>Bio:</Text>
                                <TextInput
                                    style={styles.bioInput}
                                    placeholder="Change your bio"
                                    placeholderTextColor="#aaa"
                                    value={bio}
                                    onChangeText={setBio}
                                    multiline
                                    maxLength={300}
                                />
                                <View style={styles.genderPreferenceContainer}>
                                    <View style={styles.genderInputWrapper}>
                                        <Text style={styles.label}>Gender:</Text>
                                        <TouchableOpacity onPress={() => setGenderDropdownVisible(!isGenderDropdownVisible)}>
                                            <View style={styles.inputDropdown}>
                                                <TextInput
                                                    placeholder="Select Gender"
                                                    value={gender}
                                                    editable={false}
                                                    pointerEvents="none"
                                                    style={{ flex: 1 }}
                                                />
                                                <Icon name="chevron-down" size={20} color="#BD7CFF" style={{ marginLeft: wp(2) }} />
                                            </View>
                                        </TouchableOpacity>
                                        {isGenderDropdownVisible && (
                                            <FlatList
                                                data={genderOptions}
                                                keyExtractor={(item) => item}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity onPress={() => { setGender(item); setGenderDropdownVisible(false); }}>
                                                        <Text style={styles.dropdownItem}>{item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                style={styles.dropdown}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.genderInputWrapper}>
                                        <Text style={styles.label}>Gender Preference:</Text>
                                        <TouchableOpacity onPress={() => setGenderPreferenceDropdownVisible(!isGenderPreferenceDropdownVisible)}>
                                            <View style={styles.inputDropdown}>
                                                <TextInput
                                                    placeholder="Select Preference"
                                                    value={genderPreference}
                                                    editable={false}
                                                    pointerEvents="none"
                                                    style={{ flex: 1 }}
                                                />
                                                <Icon name="chevron-down" size={20} color="#BD7CFF" style={{ marginLeft: wp(2) }} />
                                            </View>
                                        </TouchableOpacity>
                                        {isGenderPreferenceDropdownVisible && (
                                            <FlatList
                                                data={preferenceOptions}
                                                keyExtractor={(item) => item}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity onPress={() => { setGenderPreference(item); setGenderPreferenceDropdownVisible(false); }}>
                                                        <Text style={styles.dropdownItem}>{item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                style={styles.dropdown}
                                            />
                                        )}
                                    </View>
                                </View>
                                <View style={styles.habitPreferenceContainer}>
                                    <View style={styles.genderInputWrapper}>
                                        <Text style={styles.label}>Drinking:</Text>
                                        <TouchableOpacity onPress={() => setDrinkingDropdownVisible(!isDrinkingDropdownVisible)}>
                                            <View style={styles.inputDropdown}>
                                                <TextInput
                                                    placeholder="Select Drinking Preference"
                                                    value={drinking}
                                                    editable={false}
                                                    pointerEvents="none"
                                                    style={styles.textInput}
                                                />
                                                <Icon name="chevron-down" size={20} color="#BD7CFF" style={{ marginLeft: wp(2) }} />
                                            </View>
                                        </TouchableOpacity>
                                        {isDrinkingDropdownVisible && (
                                            <FlatList
                                                data={drinkingOptions}
                                                keyExtractor={(item) => item}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity onPress={() => { setDrinking(item); setDrinkingDropdownVisible(false); }}>
                                                        <Text style={styles.dropdownItem1}>{item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                style={styles.dropdown}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.genderInputWrapper}>
                                        <Text style={styles.label}>Smoking:</Text>
                                        <TouchableOpacity onPress={() => setSmokingDropdownVisible(!isSmokingDropdownVisible)}>
                                            <View style={styles.inputDropdown}>
                                                <TextInput
                                                    placeholder="Select Smoking Preference"
                                                    value={smoking}
                                                    editable={false}
                                                    pointerEvents="none"
                                                    style={styles.textInput}
                                                />
                                                <Icon name="chevron-down" size={20} color="#BD7CFF" style={{ marginLeft: wp(2) }} />
                                            </View>
                                        </TouchableOpacity>
                                        {isSmokingDropdownVisible && (
                                            <FlatList
                                                data={smokingOptions}
                                                keyExtractor={(item) => item}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity onPress={() => { setSmoking(item); setSmokingDropdownVisible(false); }}>
                                                        <Text style={styles.dropdownItem1}>{item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                style={styles.dropdown}
                                            />
                                        )}
                                    </View>
                                </View>
                                <View style={styles.locationContainer}>
                                    <Text style={styles.label}>Update Location:</Text>
                                    <TextInput
                                        style={styles.locationInput}
                                        value={location}
                                        onChangeText={setLocation}
                                    />
                                </View>
                                <View style={styles.locationContainer}>
                                    <TouchableOpacity style={styles.updateButton} onPress={enableLocation}>
                                        <Text style={styles.updateButtonText}>Update</Text>
                                    </TouchableOpacity>
                                    {address ? (
                                        <Text style={styles.locationText}>{address}</Text>
                                    ) : (
                                        <Text style={styles.locationText}>City, Country</Text>
                                    )}
                                    
                                </View>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={() => {
                                        save(); 
                                    }}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                {/* Modal for Settings */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={settingsModalVisible}
                    onRequestClose={() => setSettingsModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.editProfileTitle}>Settings</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setSettingsModalVisible(false)}>
                                    <Icon name="close" size={30} color="#000" />
                                </TouchableOpacity>

                                {/* Phone Number Input */}
                                <Text style={styles.settingsSubtitle}>Phone Number</Text>
                                <TextInput
                                    style={styles.settingsInput}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    placeholder="Enter your phone number"
                                />
                                <Text style={styles.settingsSubtitle}>Email</Text>
                                <TextInput
                                    style={styles.settingsInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email address"
                                />
                                <Text style={styles.settingsSubtitle}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.settingsInput}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Enter your password"
                                        secureTextEntry={!passwordVisible} 
                                    />
                                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                                        <Icon
                                            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                                            size={24}
                                            color="#BD7CFF"
                                            style={styles.eyeicon}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.divider80} />
                
                                {/* Notification Section */}
                                {/*
                                <View style={styles.notificationContainer}>
                                    <Text style={styles.notificationLabel}>Notification</Text>
                                    <TouchableOpacity style={styles.notificationButton}>
                                        <Text style={styles.notificationButtonText}>Manage</Text>
                                    </TouchableOpacity>
                                </View>
                                */}
                                {/* Privacy Policy */}
                                <TouchableOpacity style={styles.linkContainer} onPress={() => setPrivacyModalVisible(true)}>
                                    <Text style={styles.linkText}>Privacy Policy</Text>
                                    <Icon name="chevron-forward" size={20} color="#000" />
                                </TouchableOpacity>
                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={privacyModalVisible}
                                    onRequestClose={() => setPrivacyModalVisible(false)}
                                >
                                    <View style={styles.privmodalContainer}>
                                        <View style={styles.privmodalContent}>
                                            <TouchableOpacity style={styles.privcloseButton} onPress={() => setPrivacyModalVisible(false)}>
                                                <Icon name="close" size={30} color="#000" />
                                            </TouchableOpacity>
                                            <Text style={styles.privmodalTitle}>Privacy Policy</Text>
                                            <Text style={styles.privmodalText}>
                                                This privacy policy outlines how we collect, use, and protect your information. We respect your privacy
                                                and are committed to safeguarding your personal data. By using our services, you agree to the collection
                                                and use of information in accordance with this policy. We strive to be fully transparent about how your
                                                data is handled and ensure that your rights to privacy are always upheld.
                                            </Text>

                                            <Text style={styles.privmodalText}>
                                                We may collect your email, phone number, location data, and other personal details to improve your experience
                                                and provide personalized services. Your data will never be shared with third parties without your consent. 
                                                We use the information we gather to enhance your user experience and ensure that our services meet your needs.
                                            </Text>

                                            <Text style={styles.privmodalText}>
                                                Information collected may also include device-specific details such as your IP address, browser type, and
                                                usage patterns while interacting with our services. This helps us better understand our user base and improve
                                                functionality, ensuring a smooth and personalized experience. You have the right to access, modify, or delete
                                                your personal data at any time.
                                            </Text>
                                        </View>
                                    </View>
                                </Modal>

                                {/* Terms of Service */}
                                <TouchableOpacity style={styles.linkContainer} onPress={() => setTermsModalVisible(true)}>
                                    <Text style={styles.linkText}>Terms of Service</Text>
                                    <Icon name="chevron-forward" size={20} color="#000" />
                                </TouchableOpacity>
                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={termsmodalVisible}
                                    onRequestClose={() => setTermsModalVisible(false)}
                                >
                                    <View style={styles.privmodalContainer}>
                                        <View style={styles.privmodalContent}>
                                            <TouchableOpacity style={styles.privcloseButton} onPress={() => setTermsModalVisible(false)}>
                                                <Icon name="close" size={30} color="#000" />
                                            </TouchableOpacity>
                                            <Text style={styles.privmodalTitle}>Terms of Service</Text>
                                            <Text style={styles.privmodalText}>
                                                These Terms of Service govern your use of our app and the services we provide. By accessing or using the app,
                                                you agree to comply with these terms. We reserve the right to modify or update these terms at any time, and
                                                it is your responsibility to review them periodically. Continued use of the app after changes means you
                                                accept the updated terms. Please ensure you understand any changes before continuing use.
                                            </Text>
                                            <Text style={styles.privmodalText}>
                                                You agree not to use the app for any unlawful or prohibited activities. Misuse of the app, including unauthorized access,
                                                tampering with content, or harming other users, will result in termination of your account. We retain the right to suspend
                                                or terminate accounts that violate these terms and restrict your access without warning.
                                            </Text>
                                            <Text style={styles.privmodalText}>
                                                The app and its content are provided "as is" without any warranties, expressed or implied. We are not
                                                responsible for damages arising from your use of the app, including data loss, unauthorized access, or
                                                service interruptions. You use the app at your own risk and agree to hold us harmless from claims resulting from your use.
                                            </Text>
                                        </View>
                                    </View>
                                </Modal>

                                <View style={styles.divider80} />

                                {/* Log Out and Delete Account Buttons */}
                                <TouchableOpacity style={styles.button1} onPress={() => navigation.navigate('Landing')}>
                                    <Icon name="log-out-outline" size={20} color="#fff" style={styles.icon} />
                                    <Text style={styles.buttonText}>Log Out</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.button1} onPress={() => {delete1();}}>
                                    <Icon name="trash-outline" size={20} color="#fff" style={styles.icon} />
                                    <Text style={styles.buttonText}>Delete Account</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={() => {
                                        save2(); 
                                    }}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
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
    greeting: {
        fontSize: wp(13),
        color: '#000',
        marginVertical: hp(4),
    },
    profileImage: {
        width: wp(35),
        height: wp(35),
        borderRadius:  wp(35), 
        borderWidth: 2,
        borderColor: '#E8D1FF',
        marginBottom: hp(3),
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8D1FF',
        padding: hp(2),
        borderRadius: wp(3),
        marginTop: hp(3),
        width: wp(80),
        height: hp(12),
        justifyContent: 'center',
    },
    button1: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8D1FF',
        padding: hp(1),
        borderRadius: wp(13),
        marginTop: hp(3),
        width: wp(80),
        height: hp(6),
        justifyContent: 'center',
    },

    icon: {
        marginRight: wp(2),
    },
    buttonText: {
        fontSize: wp(4),
        color: '#000000',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: wp(90),
        backgroundColor: '#FFFFFF',
        borderRadius: wp(5),
        padding: wp(5),
        alignItems: 'center', 
    },
    closeButton: {
        position: 'absolute',
        top: hp(2),
        right: wp(4),
    },
    squaresContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp(2.7),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    square: {
        width: wp(32),
        height: wp(32),
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        margin: wp(1),
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    plusText: {
        fontSize: wp(10),
        color: '#D3D3D3',
    },
    categoriesButton: {
        position: 'absolute',
        bottom: hp(1),
        left: wp(2),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.5),
        borderRadius: wp(2),
    },
    categoriesButtonText: {
        color: '#FFF',
        fontSize: wp(2.9),
    },
    bioInput: {
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: wp(3),
        height: hp(8),
        width: wp(67),
        borderColor: '#BD7CFF',
        textAlignVertical: 'top',
        marginBottom: hp(1),
    },
    saveButton: {
        marginTop: hp(2.7),
        paddingVertical: hp(1.1),
        paddingHorizontal: wp(4),
        backgroundColor: '#BD7CFF',
        borderRadius: wp(5),
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: wp(4),
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    editProfileTitle: {
        fontSize: wp(7.7),  
        fontWeight: 'bold',
        color: '#000',
        marginTop: hp(1),
        marginBottom: hp(1)
    },
    settingsSubtitle: {
        fontSize: wp(3.9),
        marginTop: hp(1.1),
    },
    settingsInput: {
        height: hp(5),
        width: wp(75),
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: wp(2),
        padding: wp(2.8),
        marginTop: hp(1.5),
    },
    divider80: {
        width: wp(69),
        height: hp(0.2),
        backgroundColor: '#E8D1FF',
        marginVertical: hp(1.5),
    },
    notificationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: wp(68),
    },
    notificationLabel: {
        fontSize: wp(4),
        color: '#000',
    },
    notificationButton: {
        padding: hp(1),
    },
    notificationButtonText: {
        color: '#BD7CFF',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: wp(68),
        paddingVertical: hp(1.1),
    },
    linkText: {
        fontSize: wp(4),
        color: '#000',
    },
    settingbutton:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8D1FF',
        borderRadius: wp(13),
        marginTop: hp(2),
        width: wp(75),
        height: hp(6.5),
        justifyContent: 'center',
    },
    gap:{
        marginTop:hp(2),
    },
    genderPreferenceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: wp(65),
        zIndex: 4,
        marginBottom:hp(1),
    },
    habitPreferenceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: wp(65),
        zIndex: 3,
        marginBottom:hp(1),
    },
    genderInputWrapper: {
        width: '48%', 
    },
    inputDropdown: {
        height: hp(4.6),
        borderColor: '#BD7CFF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(2.5),
        backgroundColor: '#F8F8F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 4,
        width: '100%',
    },
    dropdown: {
        position: 'absolute',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        maxHeight: hp(20),
        zIndex: 5,
        marginTop: hp(6.7),
    },
    dropdownItem: {
        padding: wp(2.4),
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E8D1FF',
        zIndex: 5, 
    },
    dropdownItem1: {
        padding: wp(2.4),
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E8D1FF',
        zIndex: 5, 
        fontSize: wp(2.7),
    },
    label:{
        fontSize: wp(2.7),
        paddingBottom :hp(0.5),
        marginLeft: wp(0.8),
        zIndex: 1, 
    },
    biolabel: {
        fontSize: wp(2.7),
        paddingBottom: hp(0.5),
    },
    textInput: {
        maxWidth: wp(80), 
        flex: 1, 
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: wp(63),
        zIndex: 1,
        marginTop : hp(0.5),
    },
    locationText: {
        fontSize: wp(3.3),
        color: '#000',
        width: wp(40), 
        height: hp(4.6),
        borderColor: '#BD7CFF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(2.5),
        backgroundColor: '#F8F8F8',
        paddingTop : hp(1.1),
        maxWidth: wp(80), 

        
    },
    updateButton: {
        width: wp(20),
        height: hp(4.6),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#BD7CFF',
        borderRadius: wp(3),
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: wp(3.7),
    },
    passwordContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    eyeicon: {
        marginLeft: wp(-9),
        marginTop : hp(1.5),
    },
    privmodalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    privmodalContent: {
        width: wp(90),
        backgroundColor: '#FFFFFF',
        borderRadius: wp(5),
        padding: wp(5),
        alignItems: 'center',
        height : hp(82),
    },
    privcloseButton: {
        position: 'absolute',
        top: hp(2),
        right: wp(4),
    },
    privmodalTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: hp(4),
    },
    privmodalText: {
        fontSize: wp(4),
        textAlign: 'left',
        marginBottom: hp(2),
    },
    modalContainer2: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent2: {
        height: hp(40),
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: wp(5),
    },
    modalHeader2: {
        alignItems: 'center',
        marginBottom: hp(1),
    },
    modalArrow2: {
        fontSize: hp(2.7),
        color: '#000',
    },
    modalTitle2: {
        fontSize: hp(2),
        fontWeight: 'bold',
        color: '#000',
    },
    categoriesList: {
        marginTop: hp(1.1),
    },
    categoryButton: {
        paddingVertical: hp(1.1),
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    categoryText: {
        fontSize: hp(1.8),
        color: '#000',
    },
});

export default Profile;
