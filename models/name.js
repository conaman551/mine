import React, { useState, useEffect, useRef,useContext } from 'react';
import { Image, View, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Keyboard, TouchableOpacity, FlatList, Animated, Dimensions  } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';
import { AuthContext } from "../context/AuthContext";

const API_URL = localAddress

function Name({ route }) {
    
    const loadingAnimation = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    const navigation = useNavigation();
     const { saveLoading,userID } = useContext(AuthContext); //change to getFirstName

    useEffect(() => {
        saveLoading(false);
        const startAnimation = () => {
            loadingAnimation.setValue(0);
            Animated.loop(
                Animated.timing(loadingAnimation, {
                    toValue: screenWidth * 0.36,
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

    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [day, setDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [year, setYear] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setDropdownVisible(false);
    };

    const handleSubmit = async () => {
        const name = {
            uid: userID,
            firstName : firstName,
            surname : surname,
        }
        console.log(selectedMonth);
        const monthIndex = months.indexOf(selectedMonth) + 1;
        const dob = {
            uid: userID,
            day : day,
            month: monthIndex,
            year: year,
        };

        console.log('name:', name);
        console.log('dob:', dob);

        try{
            const response1 = await fetch(`${API_URL}/users/submit-name`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(name)
            })
            const response2 = await fetch(`${API_URL}/users/submit-dob`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dob)
            })
            if(response1.ok && response2.ok){
                navigation.navigate('Gender');//need change to num verify
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
                    onPress={() => navigation.navigate('Emailverify')}
                >
                    <Icon name="arrow-back" size={45} color="#BD7CFF" />
                </TouchableOpacity>
                <Image 
                    source={require("../assets/mine-logo.png")} 
                    style={styles.logo} 
                    resizeMode="contain" 
                />
                <View style={styles.divider} />
                <Animated.View style={[styles.lighterDivider, { width: screenWidth * 0.36 }]} />
                <Animated.View style={[styles.divider2, { width: loadingAnimation, backgroundColor: '#E8D1FF' }]} />
                <Text style={styles.title}>What's your name?</Text>
                <Text style={styles.infoText}>
                    * Please note, the name you enter will appear on your profile.
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input1}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        style={styles.input1}
                        placeholder="Surname"
                        value={surname}
                        onChangeText={setSurname}
                    />
                </View>
                
                <Text style={styles.genderTitle}>What's your date of birth?</Text>
                <View style={styles.dateInputContainer}>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.label}>Day</Text>
                        <TextInput
                            style={[styles.input2, styles.dayInput]}
                            placeholder="DD"
                            placeholderTextColor="#C7C7CD"
                            keyboardType="numeric"
                            maxLength={2}
                            value={day}
                            onChangeText={setDay}
                        />
                    </View>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.label}>Month</Text>
                        <TouchableOpacity onPress={() => setDropdownVisible(!isDropdownVisible)}>
                            <TextInput
                                style={[
                                    styles.input2, 
                                    styles.monthInput, 
                                    { color: selectedMonth ? '#000' : '#C7C7CD' } // Dynamic color change
                                ]}
                                placeholder="MMM"
                                placeholderTextColor="#C7C7CD"
                                value={selectedMonth}
                                editable={false} 
                                pointerEvents="none" 
                            />
                        </TouchableOpacity>
                        {isDropdownVisible && (
                            <FlatList
                                data={months}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleMonthSelect(item)}>
                                        <Text style={styles.dropdownItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                style={styles.dropdown}
                            />
                        )}
                    </View>
                    <View style={styles.dateInputWrapper}>
                        <Text style={styles.label}>Year</Text>
                        <TextInput
                            style={[styles.input2, styles.yearInput]}
                            placeholder="YYYY"
                            placeholderTextColor="#C7C7CD"
                            keyboardType="numeric"
                            maxLength={4}
                            value={year}
                            onChangeText={setYear}
                        />
                    </View>
                </View>
                <TouchableOpacity 
                style={styles.nextButton}
                onPress={()=>{handleSubmit()}}>
                    <Text style={styles.nextButtonText}>Next</Text>
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
        width: wp(36), 
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
        marginTop: hp(7),
        fontSize: wp(7),
        color: '#000',
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        width: wp(80),
        marginTop: hp(4),
        justifyContent: 'space-between',
    },
    input1: {
        flex: 1,
        height: hp(6),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(2.5),
        backgroundColor: '#F8F8F8',
        marginHorizontal: wp(1), 
    },
    input2: {
        height: hp(6),
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(2.5),
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
    },
    infoText: {
        marginTop: hp(2),
        fontSize: wp(3),
        color: '#BD7CFF',
        textAlign: 'center',
        width: wp(80),
    },
    genderTitle: {
        marginTop: hp(8.3),
        fontSize: wp(7),
        color: '#000',
        textAlign: 'center',
    },
    dateInputContainer: {
        flexDirection: 'row',
        width: wp(80),
        marginTop: hp(3),
        justifyContent: 'space-between',
    },
    dateInputWrapper: {
        alignItems: 'center',
        width: '32%', 
    },
    label: {
        fontSize: wp(3),
        color: 'grey',
        marginBottom: 5,
    },
    dropdown: {
        width: wp(24),
        maxHeight: hp(13), 
        backgroundColor: '#FFFFFF',
        borderColor: '#E8D1FF',
        borderWidth: 1,
        borderRadius: wp(2.5),
        position: 'absolute',
        top: hp(6),
        zIndex: 1,
    },
    dropdownItem: {
        padding: wp(2.4),
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E8D1FF',
    },
    dayInput: {
        width: '100%',
    },
    monthInput: {
        width: wp(25),
    },
    yearInput: {
        width: '100%',
    },
    nextButton: {
        marginTop: hp(12.1),
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
});

export default Name;
