import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import React, { useState, useRef } from 'react';

import FlipToggle from 'react-native-flip-toggle-button';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import FilterIcon from "../assets/ellipses-icon.png";
import rewindIcon from "../assets/back-icon.png";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeFilterScreen() {
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Independent state for each slider
    const [isDistanceOn, setIsDistanceOn] = useState(false);
    const [isAgeOn, setIsAgeOn] = useState(false);
    const [distance, setDistance] = useState(50);
    const [ageRange, setAgeRange] = useState([18, 30]); 

    // Store the original state of the sliders when the modal opens
    const originalState = useRef({ distance: isDistanceOn, age: isAgeOn });

    // Open modal and save the original states
    const openModal = () => {
        // Save original state when modal opens
        originalState.current = { distance: isDistanceOn, age: isAgeOn };
        setShowFilterModal(true);
    };

    // Save the changes made in the modal
    const handleSave = () => {
        setShowFilterModal(false);
    };

    // Revert to the original state if "Cancel" is clicked
    const handleCancel = () => {
        // Reset sliders to their original positions
        setIsDistanceOn(originalState.current.distance);
        setIsAgeOn(originalState.current.age);
        setShowFilterModal(false);
    };

    return (
        
        <View>
            <View style={styles.container}>
                {/* Rewind Button */}
                <TouchableOpacity>
                    <Image 
                        style={styles.iconImage}
                        source={rewindIcon}
                    />
                </TouchableOpacity>

                {/* Mine Logo */}
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />

                {/* Filter button */}
                <TouchableOpacity 
                    onPress={openModal} 
                >
                    <Image 
                        style={styles.iconImage}
                        source={FilterIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />
            <View style={styles.divider2} />

            {/* Filter Modal */} 
            {showFilterModal && (
                <Modal
                    transparent={true}
                    visible={showFilterModal}
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    {/* Backdrop that closes the modal */}
                    <TouchableOpacity
                        style={stylesFilterModal.backDrop}
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)} // Closes modal when clicking outside
                    >
                        {/* Empty view to catch the backdrop press */}
                        <View style={{ flex: 1 }} />
                    </TouchableOpacity>

                    {/* Modal content */}
                    <View style={stylesFilterModal.container}>
                        {/* Header */}
                        <Text style={stylesFilterModal.header}>Sort by:</Text>
                        
                        {/* Distance */}
                        <View style={stylesFilterModal.outerOptionContainer}>
                            <Text style={stylesFilterModal.headerText}>Maximum Distance</Text> 
                            <Text style={stylesFilterModal.distanceText}>{distance} km</Text>
                            
                            {/* Slider to adjust distance */}
                            <MultiSlider
                                values={[distance]} // Use a single value array to get 1 thumb
                                min={1}
                                max={200}
                                step={1}
                                sliderLength={wp(60)} // Slider length matches the distance slider
                                onValuesChange={(value) => setDistance(value[0])}
                                selectedStyle={{
                                    backgroundColor: "#000000", // Matches the minimumTrackTintColor of the Slider
                                }}
                                unselectedStyle={{
                                    backgroundColor: "#635f5f", // Matches the maximumTrackTintColor of the Slider
                                }}
                                markerStyle={{
                                    //height and width not same size as Slider. I guesstimated size. 
                                    //Slider doesn't allow you to change Thumb Size..., so I can only guess Multisliders height and width to match Slider
                                    height: hp(2.5),
                                    width: hp(2.5),
                                    borderRadius: hp(1.5),
                                    backgroundColor: "#000000", 
                                    borderColor: "#000",
                                    //borderWidth: 1,
                                    
                                }}
                            />

                            {/* Toggle Button */}
                            <View style={stylesFilterModal.optionContainer}>
                                    <Text style={stylesFilterModal.optionText}>
                                        Show people slightly out of maximum distance if I run out of matches.
                                    </Text>
                                    <FlipToggle
                                        value={isDistanceOn}
                                        buttonWidth={wp(11)}
                                        buttonHeight={hp(3)}
                                        sliderWidth={hp(2.5)}
                                        sliderHeight={hp(2.5)}
                                        sliderOnColor="#FFFFFF"
                                        sliderOffColor="#FFFFFF"
                                        buttonOnColor="#000000"
                                        buttonOffColor="#635f5f"
                                        sliderRadius={hp(10)}
                                        buttonRadius={hp(10)}
                                        //'margin' property not working??
                                        //margin={wp(200)}
                                        onToggle={(newState) => setIsDistanceOn(newState)}
                                    />
                            </View>
                        </View>

                        {/* Age */}
                        <View style={stylesFilterModal.outerOptionContainer}>
                            <Text style={stylesFilterModal.headerText}>Age Range</Text>
                            <Text style={stylesFilterModal.distanceText}>{ageRange[0]} - {ageRange[1]} years</Text>
                            
                            <MultiSlider
                                values={ageRange}
                                min={18}
                                max={100}
                                step={1}
                                sliderLength={wp(60)} // Slider length matches the distance slider
                                onValuesChange={(values) => {
                                    setAgeRange(values); // Update age range state
                                }}
                                selectedStyle={{
                                    backgroundColor: "#000000", // Matches the minimumTrackTintColor of the Slider
                                }}
                                unselectedStyle={{
                                    backgroundColor: "#635f5f", // Matches the maximumTrackTintColor of the Slider
                                }}
                                markerStyle={{
                                    //height and width not same size as Slider. I guesstimated size. 
                                    //Slider doesn't allow you to change Thumb Size..., so I can only guess Multisliders height and width to match Slider
                                    height: hp(2.5),
                                    width: hp(2.5),
                                    borderRadius: hp(1.5),
                                    backgroundColor: "#000000", 
                                    borderColor: "#000",
                                    //borderWidth: 1,
                                    
                                }}
                            />

                            <View style={stylesFilterModal.optionContainer}>
                                <Text style={stylesFilterModal.optionText}>
                                    Show people slightly outside of age range if I run out of matches.
                                </Text>
                                {/* Toggle Button */}
                                <FlipToggle
                                    value={isAgeOn}
                                    buttonWidth={wp(11)}
                                    buttonHeight={hp(3)}
                                    sliderWidth={hp(2.5)}
                                    sliderHeight={hp(2.5)}
                                    sliderOnColor="#FFFFFF"
                                    sliderOffColor="#FFFFFF"
                                    buttonOnColor="#000000"
                                    buttonOffColor="#635f5f"
                                    sliderRadius={hp(10)}
                                    buttonRadius={hp(10)}
                                    //'margin' property not working??
                                    //margin={wp(200)}
                                    onToggle={(newState) => setIsAgeOn(newState)}
                                />
                            </View>
                        </View>

                        <View style={stylesFilterModal.saveContainer}>
                            <TouchableOpacity onPress={handleSave}>
                                <Text style={stylesFilterModal.closeText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCancel}>
                                <Text style={stylesFilterModal.closeText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 130,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: wp(5),
        backgroundColor: '#FFFFFF',
        paddingTop: 28,
    },
    logo: {
        width: 100,
        height: 100,
    },
    divider: {
        marginTop: -15,
        width: '100%',
        height: 5,
        backgroundColor: '#E8D1FF',
    },
    divider2: {
        width: '100%',
        height: 5,
        backgroundColor: '#E8D1FF',
        marginVertical: 8,
    },
    iconImage: {
        width: hp(4),
        height: hp(4),
        resizeMode: 'contain',
    },
});

const stylesFilterModal = StyleSheet.create({
    backDrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        position: 'absolute',
        width: wp(80),
        backgroundColor: '#BD7CFF',
        borderRadius: 10,
        alignItems: 'stretch',
        //paddingVertical: hp(2),
        alignSelf: 'center',
        justifyContent: 'center',
        marginVertical: hp(18),
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: hp(4),
        paddingHorizontal: wp(2),
        borderBottomWidth: 5,
        borderBottomColor: '#E8D1FF',
    },
    outerOptionContainer: {
        paddingHorizontal: wp(3),
        alignItems: 'center',
        paddingVertical: hp(2),
        borderBottomWidth: 3,
        borderBottomColor: '#E8D1FF',
    },
    optionContainer: {
        width: '100%',
        paddingHorizontal: wp(2),
        //paddingVertical: hp(2),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 12,
        //textAlign: 'center',
        paddingRight: wp(10),
    },
    closeText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
       // paddingVertical: hp(2.1),
    },
    saveContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(3),
    },

    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: hp(1),
    },
    distanceText: {
        fontSize: 16,
        marginBottom: hp(1),
    },
    
});