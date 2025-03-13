import React, { useState, useEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, Animated, Dimensions  } from "react-native";
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import * as ImageManipulator from 'expo-image-manipulator';

const API_URL = localAddress

function Photo({ route }) {
    const userId = route.params.userId;
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState([null, null, null, null]);
    const [selectedImages, setSelectedImages] = useState([null, null, null, null]);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [modalVisible, setModalVisible] = useState(true);
    const [activeSquare, setActiveSquare] = useState(null);

    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.63,
                    duration: 1500,
                    useNativeDriver: false,
                })
            ).start();
        };
    
        startAnimation();
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        })();
    }, []);
    

    const categories = ["Career", "Hobby", "Fav Food", "Family", "Sports", "Travel", "Pet Picture", "Fashion", "Personality", "Social", "Achievement", "Religion", "Wild Card"];

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

    const handleImageUpload = async (index) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        // console.log(result)
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImages = [...selectedImages];
            const manipResult = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 200, height: 150 } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG } );
           let localUri = manipResult.uri;
            newImages[index] = localUri;
            setSelectedImages(newImages);
           let filename = localUri.split('/').pop();
    // Infer the type of the image
       let match = /\.(\w+)$/.exec(filename);
     let type = match ? `image/${match[1]}` : `image`;
    // Upload the image using the fetch and FormData APIs
    let formData = new FormData();
    // Assume "photo" is the name of the form field the server expects
    formData.append('image', { uri: localUri, name: filename, type });
    formData.append('uid', userId);
    formData.append('categoryName', selectedCategory[index]);
    ////JSON.stringify(localUri))
    try{
        const response = await fetch(`${API_URL}/images/update_category/${index + 1}/`, {
        method: 'PUT',
        body: formData,
        headers: {
            'content-type': 'multipart/form-data',
        },
    })
    if (!response.ok) {
        console.log('Try again')
        return;
       
    }
    else {
        const res = await response.json()
        console.log('url')
        console.log(res.fileUrl)
      //  saveProfilePic(res.fileUrl)
    }

        }
            catch(error){
                console.log('Error', error);
            }
        }
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

    const handleSubmit = async () => {
        if (selectedCategory.some(category => category === null || category === undefined)) {
            console.log('Error: Some categories are missing'); //To change
            // navigation.navigate('Userlocation', {userId : userId}); //To remove
            return; //To remove
        }
        const validImages = selectedImages.filter(image => image !== null && image !== undefined);
        if (validImages.length !== selectedImages.length) {
            console.log('Error: Some images are missing'); //To change
            // navigation.navigate('Userlocation', {userId : userId}); //To remove
            return; //To remove
        }
        navigation.navigate('Userlocation', {userId : userId});
        // console.log(selectedCategory) //To remove
        // console.log(selectedImages.map(image => image.base64)) //To remove
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Preference', {userId : userId})} 
            >
                <Icon name="arrow-back" size={45} color="#BD7CFF" />
            </TouchableOpacity>
            <Image 
                source={require("../assets/mine-logo.png")} 
                style={styles.logo} 
                resizeMode="contain" 
            />
            <View style={styles.divider} />
            <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.63 }]} />
            <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
            <Text style={styles.promptText}>Please upload a photo.</Text>

            <View style={styles.squaresContainer}>
                {[0, 1, 2, 3].map((_, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[
                            styles.square,
                            index === 0,
                            index === 1,
                            index === 2,
                            index === 3,
                        ]}
                        onPress={() => handleImageUpload(index)}
                    >
                        {selectedImages[index] ? (
                            <Image source={{ uri: selectedImages[index] }} style={styles.image} />
                        ) : (
                            <Text style={styles.plusText}>+</Text>
                        )}
                        <TouchableOpacity 
                            style={styles.categoriesButton} 
                            onPress={() => handleSquarePress(index)}
                        >
                            <Text style={styles.categoriesButtonText}>
                                {selectedCategory[index] ? selectedCategory[index] : "Categories +"}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.explain}>
                <TouchableOpacity style={styles.explanationContainer} onPress={() => setModalVisible(true)}>
                    <Text style={styles.explanationText}>How are we different?</Text>
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
                            source={require('../assets/window.png')} // Add this line
                            style={styles.modalImage} // Add a new style for the image
                            resizeMode="contain" // Ensures the image fits well
                        />
                        <Text style={styles.modalText}>
                            we have created a profile that reflects the true essence of the person: their hobbies, interests, careers and passions, offering a{' '}
                            <Text style={{ fontWeight: 'bold' }}>window</Text> into the person’s heart.
                        </Text>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleSubmit}
            >
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

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
        width: wp(63), 
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
        marginTop: hp(5),
        fontSize: wp(7),
        color: '#000',
        textAlign: 'center',
    },
    squaresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: wp(90),
        aspectRatio: 1,
        marginTop: hp(5),
        justifyContent: 'space-between',
    },
    square: {
        width: '48%', 
        height: '48%',
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#D3D3D3',
        borderRadius: hp(1.7),
        marginBottom: hp(1.5),
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: wp(4.5),
    },
    plusText: {
        fontSize: hp(5),
        color: '#D3D3D3',
    },
    categoriesButton: {
        position: 'absolute',
        bottom: hp(1),
        left: wp(2),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: hp(2),
    },
    categoriesButtonText: {
        color: '#FFF',
        fontSize: hp(1.6),
    },
    nextButton: {
        marginTop: hp(3.4),
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
    explain: {
        marginTop: hp(2),
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
        width: wp(30), 
        height: wp(30),
        marginTop : hp(-1)
    },
    modalText: {
        fontSize: wp(3.5), 
        color: '#444',
        textAlign: 'center',
        marginBottom: hp(2),
        lineHeight: 20,
        paddingHorizontal: hp(2), 
        marginTop : hp(1)
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
});

export default Photo;
