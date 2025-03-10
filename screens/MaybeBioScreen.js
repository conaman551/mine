import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Card from './HomeScreenAssets/card';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportModal from '../components/ReportModal';
import { localAddress } from '../constants';

export default function MaybeBioScreen({ loggedInUserId, user, onClose, onNoPress, onLikePress, onReportPress, onRemoveUser }) {
    const [showReportModal, setShowReportModal] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const handleOptionSelect = (option) => {
        setShowReportModal(false);
    };


    const postAction = async (user, action) => {
      try {
          const response = await fetch(`${localAddress}/users/${loggedInUserId}/${action}/${user.UID}`, {
              method: 'POST',
          });
          if (!response.ok) throw new Error(`Failed to ${action} user`);
          console.log(`User ${user.UID} ${action}d successfully`);
          // Store the last action and user for potential rewind
          //setLastAction(action);
          //setLastUser(user);
          //return true;
      } catch (error) {
          console.error(error);
          //return false;
      }
    };

    const handleLikePress = () => {
      // Call the postAction function with 'like'
      postAction(user, 'like').then(() => {
        onRemoveUser(user); 
        onClose(); // Close the modal and trigger parent to update the maybe list
      });
    };

    // Handle dislike press
    const handleNoPress = () => {
        // Call the postAction function with 'dislike'
        postAction(user, 'dislike').then(() => {
          onRemoveUser(user); 
          onClose(); // Close the modal and trigger parent to update the maybe list
        });
      };
    
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: "#FFFFFF"}}>
    <View style={styles.container}>
      {/* Up-Arrow Button */}
      <View style={styles.topButtonsContainer}>
         {/* Report Button (Above Maybe Button) */}
         <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => 
                {setShowReportModal(true);}
                }
        >
          <Image source={require('../assets/report-icon.png')} style={styles.buttonIconReport } />
        </TouchableOpacity>
        <TouchableOpacity style={styles.upArrowButton} onPress={onClose}>
          <Image source={require('../assets/up-arrow-button.png')} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Card user={user} />
        </View>

        {/* User Info */}
        {/* <Text style={styles.name}>{user.name}, 20</Text>
        <Text style={styles.distance}>27 km away</Text> */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>Bio !</Text>
          <Text style={styles.bio}>{user.Bio}
          </Text>
        </View>
      </ScrollView>

      {/* <Text style={styles.ps}>P.S. hope you swipe right</Text> */}

      {/* Bottom Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setShowConfirmRemoveModal(true)}>
          <Image source={require('../assets/no-button.png')} style={styles.buttonIcon} />
        </TouchableOpacity>

       

        {/* <View style={styles.questionButtonWrapper}>
          <TouchableOpacity style={styles.button} onPress={onMaybePress}>
            <Image source={require('../assets/maybe-button.png')} style={styles.buttonIcon} />
          </TouchableOpacity>
        </View> */}

        <TouchableOpacity style={styles.button} onPress={handleLikePress}>
          <Image source={require('../assets/like-button.png')} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>

            {/* Report Modal */}
            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onOptionSelect={handleOptionSelect}
                uid1 = {loggedInUserId}
                uid2={user.UID}
            />


            {/* Confirmation Modal for Removing from Maybe List */}
            {showConfirmRemoveModal && (
                    <Modal
                        transparent={true}
                        animationType="fade"
                        visible={showConfirmRemoveModal}
                        onRequestClose={() => setShowConfirmRemoveModal(false)}
                    >
                        <View style={stylesRemoveConfirmModal.confirmModalBackDrop}>
                            <View style={stylesRemoveConfirmModal.confirmModalContainer}>
                                <Text style={stylesRemoveConfirmModal.confirmText}>
                                    Are you sure you want to remove {user.First_name} from your Maybe list?
                                </Text>
                                <View style={stylesRemoveConfirmModal.confirmButtonContainer}>
                                    <TouchableOpacity
                                        style={stylesRemoveConfirmModal.confirmButton}
                                        onPress={() => {
                                          handleNoPress();
                                            setShowConfirmRemoveModal(false);
                                            onClose();                                    
                                        }}
                                    >
                                        <Text style={stylesRemoveConfirmModal.confirmButtonText}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={stylesRemoveConfirmModal.confirmButton}
                                        onPress={() => setShowConfirmRemoveModal(false)}
                                    >
                                        <Text style={stylesRemoveConfirmModal.confirmButtonText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: wp(5),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    //marginHorizontal: wp(-8),
    //paddingHorizontal: wp(10),

    scrollContainer: {
      flexGrow: 1,
      width: '100%',
      paddingHorizontal: wp(5),
      paddingTop: hp(10),
      paddingBottom: hp(50), // Add bottom padding to prevent overlap with buttons
      marginBottom: hp(10),
    },


  },
  upArrowButton: {
    position: 'absolute',
    top: 57,
    alignSelf: 'center',
    zIndex: 1,
    paddingBottom: hp(10),
    resizeMode: 'contain',
    backgroundColor: '#FFFFF',
  },
  card:{
    marginLeft: wp(5)
  },
  buttonIcon: {
    width: wp(14),
    height: wp(14),
    tintColor: '#E8D1FF', // Adjust color if needed
    //padding: wp(10)
    resizeMode: 'contain',
    borderRadius: 30,
    //borderWidth: 33,
  },
  buttonIconReport: {
    width: wp(14),
    height: wp(14),
    tintColor: '#FF0000', // Adjust color if needed
    //padding: wp(10)
    resizeMode: 'contain',
    borderRadius: 30,
    //borderWidth: 33,
  },
  
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  distance: {
    fontSize: 16,
    color: '#777',
    marginBottom: hp(1),
  },
  bioContainer: {
    justifyContent: 'center',
    //alignItems: 'flex-start',
    paddingHorizontal: wp(10),
  },
  bioTitle: {
    fontSize: 26,
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 20,
    textAlign: 'left',
    marginBottom: hp(12),

  },
  ps: {
    fontSize: 20,
    textAlign: 'left',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: hp(0), // Adjust this value depending on the height of your bottom navigation bar********
    flexDirection: 'row',
    justifyContent: 'space-around',
    //width: '100%',
    width: wp(120),
    paddingHorizontal: 40,
    paddingBottom: hp(4),
  },
  button: {
    width: wp(14),
    height: wp(14),
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    //shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  questionButtonWrapper: {
    alignItems: 'center',
  },



  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: wp(5),
    marginVertical: hp(1),
    zIndex: 1,
  },
  upArrowButton: {
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  reportButton: {
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },

});




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

const stylesRemoveConfirmModal = StyleSheet.create({
    confirmModalBackDrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    confirmModalContainer: {
        width: wp(80),
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    confirmButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#BD7CFF',
        borderRadius: 5,
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});