import { ActivityIndicator, View, Text, Dimensions, Platform, TextInput, StyleSheet, Touchable, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Matches from '../components/Matches';
import MatchesTemp from '../components/MatchesTemp';
//import { chatData } from "../constants";
import { localAddress } from '../constants';
import { useNavigation, useFocusEffect, useIsFocused } from "@react-navigation/native";
import iceSpiceTemp from '../assets/icespicetemp.png'




export default function ChatScreen2({userId}){
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    

    const [chatData, setChatData] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state


    useFocusEffect(React.useCallback(() => {
        // Fetch datesData from the backend using the userId
        fetch(`${localAddress}/chats/${userId}`)

            .then(response => response.json())
            .then(data => {
                console.log('Fetched Data:', data);
                setChatData(data); // Set fetched data to state
                setLoading(false);  // Stop loading
            })
            .catch(error => {
                console.error(`Error fetching data: ${userId}`, error);
                setLoading(false);  // Stop loading in case of error
            });
    }, [userId]));

    // Display loading spinner while fetching data
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    

    // Fetch chat data for specific match when a match is clicked
   const handlePress = async (UID1, UID2, name, img, chat_id, url1) => {
        try {
            // Fetch chat history for both users
            const response = await fetch(`${localAddress}/chats/messages/${chat_id}`);
            const chatHistory = await response.json();
            // Navigate to ChatDetailsScreen and pass chat history and other details
            navigation.navigate('ChatDetails', {
                name: name,
                img: img, 
                chat: chatHistory,  // Pass the fetched chat history
                UID1: UID1,
                UID2: UID2,  // Passing both UIDs for future messages
                chat_id: chat_id,
                userId: userId,
                url1: url1,
            });
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };
    
      
        

    return(
        <SafeAreaView style={{flex: 1, backgroundColor: "#E8D1FF"}}
        //<SafeAreaView style={{flex: 1, backgroundColor: "#FFFFFF"}}
        >
            {/* Recent Matches Header */}
            <View style={styles.recentMatches}> 
                <Text
                    style = {styles.recentMatchesHeader}
                >Recent Matches</Text>
            

                {/* scrolling matches */}
                <Matches userId={userId} />
                {/* <MatchesTemp /> */}
            </View>



            <View style={[styles.outerBottomContainer, {paddingBottom: insets.bottom  +hp(30)}]}>
                {/* Messages Header */}
                <View styles={{borderBottomWidth: 5,
                        borderBottomColor: "#E8D1FF"}}> 
                    <Text style = {styles.messagesHeader}>
                        Messages
                    </Text>
                    {/* chats */}
                </View>
                
                 {/* Check if chatData is empty and display the message if so */}
                {chatData && chatData.length > 0 ? (
                <FlatList data={chatData.reverse()}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(match) => match.Chat_id.toString()}
                    contentContainerStyle={{ paddingBottom: hp(20)}}
                    renderItem={({item: match}) => { //just renamed item to match

                        
                        // Only render the chat container if Content is not null
                        if (!match.Content) {
                            return null; // Skip rendering this item if Content is null
                        }

                        return (
                            <TouchableOpacity
                                onPress={() => handlePress(match.UID1, match.UID2, match.First_name, match.Main_image_url, match.Chat_id, match.url1)} 
                            >
                                <View style={styles.outerChatContainer}>
                                    {/* match's profile pic*/}
                                    <View style = {styles.chatsImage1}>
                                        <Image
                                            //source = {match.Main_image_url}
                                            source={{uri: match.url1}} //HARDCODED IMG
                                            style={styles.chatsImage2}
                                        />
                                    </View>

                                    {/* Information */}
                                    <View style={stylesChat.container}>
                                        <View style={stylesChat.container2}>
                                            <View style={stylesChat.flexRowCentered}>
                                                <View style={stylesChat.flexRow}>
                                                    <Text style={stylesChat.boldBaseText}> {match.First_name} </Text>
                                                </View> 

                                                
                                            </View>

                                            <Text style={{fontSize: 14}}>
                                                {new Date(match.Time_sent).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true,
                                            })}
                                            </Text>
                                        </View>
                                        
                                        <View style={styles.lastMessage}>
                                            <Text style={{color: "#A2A2A2"}}>
                                                {match.Content.length > 35
                                                ? match.Content.slice(0, 35) + "..." 
                                                : match.Content }
                                            </Text> 
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
                ) : (
                    <View style={{ padding: 20, alignItems: "center", paddingTop: hp(40), }}>
                        <Text style={{ fontSize: 16, color: "#A2A2A2" }}>You have no chats started.</Text>
                    </View>
                )}
            </View>

        
        </SafeAreaView>
    )
    
}


const styles = StyleSheet.create({
    recentMatches: {
      backgroundColor: "#E8D1FF",
      //backgroundColor: "#FFFFFF",
      marginBottom: hp(2),
      borderBottomLeftRadius: hp(4), 
      borderBottomRightRadius: hp(4),
      paddingHorizontal: wp(3),

    },
    recentMatchesHeader: {
        fontSize: hp(3),
        fontWeight: 'bold',
        paddingLeft: hp(2),
    },
    outerBottomContainer: {
        backgroundColor: "#FFFFFF",
        //flex: 1,
        
  
   
        
    },
    messagesHeader: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: hp(3),
        borderStyle: 'solid',
        borderBottomWidth: 5,
        paddingTop: hp(2),
        paddingBottom: hp(2),
        borderBottomColor: "#E8D1FF",
        
    },
    outerChatContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(2),
        borderBottomWidth: 5,
        borderBottomColor: "#E8D1FF",
        
    },
    chatsImage1: {
        width: hp(15),
        height: hp(15),
        justifyContent: 'center',
    },
    chatsImage2: {
        width: "80%",
        height: "80%",
        borderRadius: hp(8),
    },
    lastMessage:{
        paddingTop: wp(4),
    }

});

const stylesChat = StyleSheet.create({
    container: {
        width: wp(82),
        height: hp(6),
        paddingRight: wp(14),
        
    },
    container2: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    flexRowCentered: {
      flexDirection: 'row',
      justifyContent: 'center',
      //alignItems: 'center',
    },
    flexRow: {
      flexDirection: 'row',
    },
    boldBaseText: {
      fontWeight: 'bold',
      fontSize: 16, 
    },
    marginRight: {
      marginRight: 4, 
    },
  });


