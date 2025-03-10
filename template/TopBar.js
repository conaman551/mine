import React from 'react';
import { Image, View, StyleSheet } from "react-native";


function TopBar() {
    return (
        <View style={styles.container}>
            <Image 
                source={require("../assets/mine-logo.png")} 
                style={styles.logo} 
                resizeMode="contain" 
            />
            <View style={styles.divider} />
            <View style={styles.divider2} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        height: 130,
        alignItems: 'center', 
        paddingTop : 28,
        backgroundColor: '#FFFFFF',
    },
    logo: {
        width: 100,
        height: 100,
    },
    divider: {
        marginTop :-15,
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
});

export default TopBar;