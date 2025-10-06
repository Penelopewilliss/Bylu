import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import Fonts from '../constants/fonts';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 1500);
    return () => clearTimeout(timer);
  }, [fadeAnim, onFinish]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appName: {
      fontSize: 48,
      ...Fonts.header,
      color: colors.primaryText,
      letterSpacing: 2,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <Text style={styles.appName}>Glowgetter</Text>
    </Animated.View>
  );
}
