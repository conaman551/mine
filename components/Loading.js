import React,{useContext} from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { AuthContext } from "../context/AuthContext";

const Loading = () => {
 const { isLoading } = useContext(AuthContext);
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isLoading}
      onRequestClose={() => {}}
    >
      <View style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
       
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loader: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default Loading;
