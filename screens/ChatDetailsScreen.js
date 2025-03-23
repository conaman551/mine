import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { useNavigation } from "@react-navigation/native";
import { establishWebSocketConnection } from '../components/WebSocket';  
import { localAddress } from '../constants';
import ReportModal from '../components/ReportModal';

import backIcon from "../assets/back-icon.png";
//import reportIcon from "../assets/report-icon.png";
import ellipsesIcon from "../assets/ellipses-icon.png";
import chatPlusIcon from "../assets/chat-plus-icon.png";
import chatSendIcon from "../assets/chat-send-icon.png";

import iceSpiceTemp from '../assets/icespicetemp.png'

export default function ChatDetailsScreen({ route }){
    const navigation = useNavigation();
    
    const {name, img, chat, UID1, UID2, chat_id, userId, url1} = route.params;
    {/* Unmatch and Report Dropdown Menu */}
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const handleOptionSelect = (option) => {
        setShowReportModal(false);
    };

    //Convert Chat History's time_sent (which is in UTC) to Local Time (depending on the user's timezone)
    const convertChatsToLocalTime = (chats) => {
        return chats.map((chat) => {
          return {
            ...chat, // Copy all properties of the chat object
            Time_sent: new Date(chat.Time_sent).toLocaleString(), // Convert UTC to local time string
          };
        });
      };
      const chatsWithLocalTime = convertChatsToLocalTime(chat);

    //const [messages, setMessages] = useState(chatsWithLocalTime); // Initialize with the chat history passed via props
    const [messages, setMessages] = useState(chat);
    const [newMessage, setNewMessage] = useState(''); // New message input field
    
    const handleUnmatch = async () => {
        try {
            const response = await fetch(`https://trippr.org:3000/chats/unmatch/${UID1}/${UID2}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                console.log('User unmatched successfully.');
                // After unmatching, you might want to navigate back to the chat list
                navigation.navigate('Chat');
            } else {
                console.error('Failed to unmatch the user.');
            }
        } catch (error) {
            console.error('Error unmatching the user:', error);
        }
    };

    const ws = useRef(null);
    // Establish WebSocket connection when component mounts
    useEffect(() => {

        // Establish connection
        ws.current = establishWebSocketConnection();
        console.log("WebSocket initialized:", ws.current);

        
        
        ws.current.onopen = () => {
            console.log("WebSocket connection opened");
            ws.current.send(JSON.stringify({type:'join', room:chat_id}));
            console.log("JOINED", chat_id);

        };

        

        ws.current.onerror = (error) => {
            console.log("WebSocket error:", error);
        };

        // Listen for messages
        ws.current.onmessage = (event) => {
            console.log("WebSocket message received:", event.data);
            try {
                // Try to parse the message as JSON
                const message = JSON.parse(event.data);

                // Update messages with the new message. 
                //NB: Keeps sending messages twice, so i used isDuplicate to Prevent adding duplicate messages
                /* setMessages((prevMessages) => {
                    const isDuplicate = prevMessages.some((msg) => msg.id === message.id);
                    if (!isDuplicate) {
                        return [...prevMessages, message];
                    }
                    return prevMessages;
                }); */
                console.log(message);
                if (message.type == "message" && message.uid != userId) {
                    const messageObj = {
                        Chat_id: chat_id,
                        Sender_id: message.uid, // User sending the message
                        Content: message.message,
                        Time_sent: new Date(),
                        Time_received: null,
                    }
                    setMessages((prevMessages) => [...prevMessages, messageObj]);
                    
                }} catch (error) {
                // If it's not JSON, just log the message (or handle it as plain text)
                console.log("Received non-JSON message:", event.data);
            }
        };

        // Clean up on unmount
        return () => {
            if (ws.current) {
                ws.current.send(JSON.stringify({type:'leave', room:chat_id}));
                ws.current.close();
            }
        };
    }, []);

    

    // Handle sending a message
    let isSending = false;
    const handleSendMessage = async () => {

        if (isSending) {
            console.log("Message already being sent, aborting...");
            return;
        }
        console.log('Sending message...');
        isSending = true;

        if (newMessage.trim()) {
            const messageObj = {
                Chat_id: chat_id,
                Sender_id: userId, // User sending the message
                Content: newMessage,
                Time_sent: new Date(),
                Time_received: null,
            };
            
             // Log before sending WebSocket message
            console.log('WebSocket sending message:', messageObj);
            
            // Send message to WebSocket server if needed
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                
                ws.current.send(JSON.stringify({type:'message', user: messageObj.Sender_id, message: messageObj.Content, room: messageObj.Chat_id}));
            } 
    
            // POST message to the backend
            console.log('POST request being sent...');
            console.log("4444", userId);
            
            try {
                const response = await fetch(`${localAddress}/chats/send_message/${chat_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        
                        uid: userId,
                        Content: newMessage,
                        
                        //Time_sent: new Date().toLocaleTimeString(),
                        //think i need to send back time as string like it was before

                        
                    }),
                });
                
    
                if (response.ok) {
                    const data = await response.json();
                    console.log("tester123", userId);
                    // Update local state with the new message (optional depending on backend response)
                    setMessages((prevMessages) => [...prevMessages, messageObj]);
                    setNewMessage(''); // Clear the input field
                } else {
                    console.error('Failed to send message to the backend.');
                }
            } catch (error) {
                console.error('Error sending message to the backend:', error);
            } finally {
                isSending = false;
            }
        }
    };

    return(
        <View style={{backgroundColor: '#E8D1FF', flex: 1}}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
        <SafeAreaView style={{flex:1}}>
            <View style={stylesHeader.outerContainer}>
            
                {/* Header */}
                <View style={stylesHeader.container}>
                    <TouchableOpacity
                        style={stylesHeader.backIcon}
                        onPress={() => navigation.navigate('Chat')}
                    >
                        {/* Back Icon */}
                        <Image 
                            style={stylesHeader.iconImage}
                            source={backIcon}
                            
                        />
                    </TouchableOpacity>

                    {/* Match Details */}

                        <View style={stylesHeader.matchDetailsContainer}>
                            {/* Match's Pic */}
                            <TouchableOpacity>
                                <View style={stylesHeader.matchImageContainer}>
                                        <Image 
                                            source={{uri: url1}} //HARDCODED
                                            style={stylesHeader.matchImage}
                                        />
                                </View>
                            </TouchableOpacity>

                            {/* Match's Name */}
                            <TouchableOpacity>
                                <View style={stylesHeader.matchNameContainer}>
                                    <Text style={stylesHeader.matchNameText}>
                                        {name}
                                    </Text>  
                                </View>
                            </TouchableOpacity>
                        </View>


                    {/* ReportIcon */}
                    <TouchableOpacity 
                        onPress={() => setShowDropdown(!showDropdown)}
                    >
                        <Image 
                                style={stylesHeader.iconImage}
                                source={ellipsesIcon}
                            />
                    </TouchableOpacity>
                    


                </View>

            </View>

        {/* Chat */}
            {/* Unmatch and Report Dropdown Menu */}
            {showDropdown && (
                        <Modal
                            transparent={true}
                            animationType="fade"
                            visible={showDropdown}
                            onRequestClose={() => setShowDropdown(false)}
                        >
                            <TouchableOpacity
                                style={stylesDropdown.backDrop}
                                activeOpacity={1}
                                onPress={() => setShowDropdown(false)}
                            >
                                <View style={stylesDropdown.dropDown}>
                                    <TouchableOpacity onPress={handleUnmatch}>
                                        <Text style={stylesDropdown.dropDownText}>Unmatch</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => alert('Block selected')}>
                                        <Text style={stylesDropdown.dropDownText}>Block</Text>
                                        {/* I will add the text explanation of options later */}
                                        {/* <Text 
                                            style={stylesDropdown.dropDownText}
                                            style={{fontSize: 12}}
                                        >You won't see them again.</Text> */}
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => 
                                            {setShowReportModal(true);
                                            setShowDropdown(false);}}
                                    >
                                        <Text style={stylesDropdown.dropDownText}>Report</Text>
                                    </TouchableOpacity>
                        </View>
                            </TouchableOpacity>
                        </Modal>
                    )}
                    
            {/* Report Modal */}
            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onOptionSelect={handleOptionSelect}
                uid1={UID1}
                uid2={UID2}
            />


            <View style={stylesChat.container}>
                {/* Date */}
                {/* <View style={stylesChat.dateContainer}>
                    <Text style={stylesChat.dateTextContainer}>
                        Today
                    </Text> */}
                
                    {/* Chat List */}
                    <FlatList 
                        // Reverse the messages array so when inverted={true}, the latest message is at the bottom
                        //also, i added slice() to prevent mutating the original array
                        data={messages.slice().reverse()} 
                        inverted={true}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: hp(15)}}
                        renderItem={({ item }) => 
                            
                            

                            <View style={{
                                padding: 10,
                                }}
                            >
                                    {/* TextContainer */}
                                <View style={{
                                    borderRadius: 10,
                                    borderBottomRightRadius: item.Sender_id === userId? 0 : 10,
                                    borderBottomLeftRadius: item.Sender_id === userId? 10 : 0,
                                    backgroundColor: item.Sender_id === userId? "#BD7CFF" : "#E8D1FF",
                                    padding: 10,
                                    alignSelf: item.Sender_id === userId ? "flex-end" : "flex-start",
                                    maxWidth:"70%" 
                                    }}
                                >
                                    <Text style={stylesChat.chatText}>{item.Content}</Text>
                                </View>
                                {/* TimeStamp */}
                                <View>
                                    {item.Sender_id === userId
                                        ? <Text style={{textAlign: 'right'}}>
                                            {new Date(item.Time_sent).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true,
                                            })}
                                        </Text>
                                        : <Text style={{textAlign: 'left'}}>
                                            {new Date(item.Time_sent).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                hour12: true,
                                            })}
                                        </Text>
                                    }
                                </View>

                            </View>
                        }
                    /> 

                {/* </View> */}
                
            </View>
        
        {/* Bottom Chat Input */}
        <View style={stylesChatInput.container}>
            <TouchableOpacity style={{paddingRight: hp(2)}}>
                <Image
                    style={stylesChatInput.icon}
                    source={chatPlusIcon}
                />
            </TouchableOpacity>


            <View style={stylesChatInput.textInputContainer}>
                <TextInput
                    value={newMessage}  // Bind 'newMessage' state to the input
                    onChangeText={setNewMessage}  // Update 'newMessage' as user types
                    placeholder="Type a message"
                    style={stylesChatInput.textInput}

                />
            </View>     

            <TouchableOpacity 
                style={{paddingLeft: hp(2)}}
                //onPress={handleSendMessage()}
                onPress={() => {
                    console.log('Send button pressed');
                    handleSendMessage();
                }}
            >
                <Image 
                    style={stylesChatInput.icon}
                    source={chatSendIcon}
                />
            </TouchableOpacity>            
                                    
        </View>
        </SafeAreaView>
        </KeyboardAvoidingView>
        </View>
    )
}

const stylesHeader  = StyleSheet.create({
    outerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',

        //Creates the purple background thingy
        backgroundColor: "#E8D1FF",

        // Hide any overflow that might cause issues with the background
        //without this, i get a weird white line at the bottom of the screen
        overflow: 'hidden',

        
    },
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: hp(2), 
        paddingBottom: hp(2), 
        borderBottomWidth: 1, 
        borderBottomColor: '#D1D5DB',
        paddingHorizontal: hp(2),
    },
    backIcon: {
        width: '20%', 
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconImage: {
        width: hp(4), 
        height: hp(4), 
        resizeMode: 'contain'
    },
    matchDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    matchImageContainer:{

        //borderWidth: 3,               
        //borderColor: "#E8D1FF",           
        borderRadius: hp(7),        
        marginRight: hp(2),           
        marginLeft: hp(4), 
    },
    matchImage: {
        width: hp(7),               
        height: hp(7),              
        borderRadius: hp(7),
    },
    matchNameContainer: {
        justifyContent: 'flex-start',	     
        alignItems: 'center', 
        flexDirection: 'row',

    },
    matchNameText: {
        fontSize: 22,     
        fontWeight: 'bold',    

    },

})

const stylesDropdown = StyleSheet.create({
    backDrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dropDown: {
        width: 150,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    dropDownText: {
        fontSize: 16,
        paddingVertical: 10,
        textAlign: 'center',
    },
})
const stylesReportModal = StyleSheet.create({
    backDrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        width: wp(80),
        backgroundColor: '#BD7CFF',
        borderRadius: 10,
        //need stretch so that the bottomBorder takes up the entire modal space. If I don't have this, then bottomBorder only underlines the length of the text.
        alignItems: 'stretch'
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderBottomWidth: 5, 
        borderBottomColor: '#E8D1FF',
    },
    optionContainer: {
        width: '100%',  
        borderBottomWidth: 3, 
        borderBottomColor: '#E8D1FF',
        //alignItems: 'center',  
        paddingVertical: 10,   
    },
    optionText: {
        fontSize: 16,
        textAlign: 'center',
        
    },
    closeText: {
        fontSize: 16,
        marginTop: 20,
        color: '#FFFFFF',
        textAlign: 'center',
        paddingBottom: 20,
    },
});

const stylesChat = StyleSheet.create({
    container: {
        marginBottom: hp(10),
        backgroundColor: "#FFFFFF",
        flex: 1,
        paddingBottom: hp(4), //fix later for different devices
    },
    dateContainer:{
        width: '100%',
        height: '100%',
    },
    dateTextContainer:{
        textAlign: 'center',
        color: "#A2A2A2",
    },
    chatText: {
        lineHeight: 20,
        textAlign: 'left',
        //color:
    }

})
const stylesChatInput = StyleSheet.create({
    container: {
        position: 'absolute',          
        flexDirection: 'row',            
        justifyContent: 'center', 
        alignItems: 'center',           
        width: '100%',                  
        paddingHorizontal: hp(6),                       
        paddingBottom: hp(5),   // EDIT THIS LATER. i need more padding for ios than android i think
        paddingTop: hp(2),                  
        backgroundColor: '#FFFFFF',     
        bottom: 0,     
        flex: 1,        
        marginTop: hp(4),         
    },
    textInputContainer: {
        flexDirection: 'row',          
        alignItems: 'center',         
        borderRadius: 16,            
        backgroundColor: '#E5E7EB',   
        paddingLeft: 12,              
        paddingRight: 12,             
        paddingTop: 12,               
        paddingBottom: 12,            
        width: '85%',   

    },
    textInput:{
        placeholderTextColor: '#A2A2A2',
        fontSize: hp(1.7),
        fontWeight: 'medium',
        paddingVertical: 0,
        width: '100%',
    },
    icon: {
        width: hp(4), 
        height: hp(4),
    },
})
