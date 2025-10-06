import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Fonts from '../constants/fonts';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start with a gentle scale-in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000, // Longer fade out
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500); // Extended from 1500ms to 2500ms for more elegance
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      // Add subtle gradient effect feel
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    appName: {
      fontSize: 56, // Larger for more impact
      fontFamily: 'PatrickHand_400Regular', // Beautiful handwritten font!
      fontWeight: '400', 
      color: colors.primaryText,
      letterSpacing: 4, // More spacing for luxury feel
      textAlign: 'center',
      // Add shadow for depth and elegance
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 2, height: 3 },
      textShadowRadius: 6,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <Animated.Text style={[styles.appName, { transform: [{ scale: scaleAnim }] }]}>
        Glowgetter
      </Animated.Text>
    </Animated.View>
  );
}
