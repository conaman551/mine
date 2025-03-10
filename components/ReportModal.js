// ReportModal.js
import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { localAddress } from '../constants';

export default function ReportModal({ visible, onClose, onOptionSelect, uid1, uid2 }) {

    const handleOptionSelect = async (reason) => {
        console.log("reporting", uid1, uid2, reason);
        try {
            // Send the report data to the backend
            const response = await fetch(`${localAddress}/chats/report/${uid1}/${uid2}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Reason: reason }),
            });
            

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Error reporting user: ${errorMessage}`);
            }

            alert(`${reason} report sent successfully`);
            onOptionSelect(reason); // Trigger any additional actions passed down
        } catch (error) {
            console.error('Error reporting user:', error);
            alert('Failed to report user. Please try again later.');
        } finally {
            onClose(); // Close the modal after the request
        }
    };

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.backDrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.container}>
                    <Text style={styles.header}>Report User</Text>

                    {/* Option: Spam */}
                    <TouchableOpacity onPress={() => handleOptionSelect('Spam')}>
                        <View style={styles.optionContainer}>
                            <Text style={styles.optionText}>Spam</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Option: Harassment */}
                    <TouchableOpacity onPress={() => handleOptionSelect('Harassment')}>
                        <View style={styles.optionContainer}>
                            <Text style={styles.optionText}>Harassment</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Option: Inappropriate Content */}
                    <TouchableOpacity onPress={() => handleOptionSelect('Inappropriate Content')}>
                        <View style={styles.optionContainer}>
                            <Text style={styles.optionText}>Inappropriate Content</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Close Button */}
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
        alignItems: 'stretch'
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 20,
        borderBottomWidth: 5,
        borderBottomColor: '#E8D1FF',
    },
    optionContainer: {
        width: '100%',
        borderBottomWidth: 3,
        borderBottomColor: '#E8D1FF',
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
