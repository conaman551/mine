import React, { useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

function Open() {
  const navigation = useNavigation();
  const [showMineLogo, setShowMineLogo] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current; 
  const widthAnim = useRef(new Animated.Value(wp(17.7))).current; 
  const leftAnim = useRef(new Animated.Value(wp(41))).current; 
  const mLogoOpacity = useRef(new Animated.Value(1)).current;


  const heartbeatSequence = () => {
    return Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]);
  };

  const startHeartbeatAnimation = () => {
    Animated.sequence([
      heartbeatSequence(),
      Animated.delay(50), 
      heartbeatSequence(),
    ]).start(() => {
      setShowMineLogo(true); 

      Animated.timing(mLogoOpacity, {
        toValue: 0,
        duration: 1,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(widthAnim, {
            toValue: wp(48),
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(leftAnim, {
            toValue: wp(29),
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          Animated.delay(200).start(() => {
            navigation.navigate('Landing');
          });
        });
      });
    });
  };

  useEffect(() => {
    startHeartbeatAnimation();

    return () => {
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Image 
          source={require("../assets/m-logo.png")} 
          style={[styles.mLogo, { opacity: mLogoOpacity, transform: [{ scale: scaleAnim }] }]} // Apply the scale and opacity animation
          resizeMode="contain"
        />
        {showMineLogo && (
          <Animated.View style={[styles.hiddenContainer, { width: widthAnim, left: leftAnim }]}>
            <Image
              source={require("../assets/mine-logo.png")}
              style={styles.mineLogo}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D1FF',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  mLogo: {
    width: wp(17.9), 
    height: wp(28), 
    position: 'relative',
  },
  hiddenContainer: {
    position: 'absolute', 
    top: hp(43.6),
    height: hp(11),
    overflow: 'hidden',
  },
  mineLogo: {
    width: wp(42),
    height: hp(11),
  },
});

export default Open;
