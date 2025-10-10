import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated, Vibration, Platform, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import type { Alarm } from '../types';

interface AlarmActiveScreenProps {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  visible?: boolean;
}

export default function AlarmActiveScreen({ alarm, onDismiss, onSnooze, visible = true }: AlarmActiveScreenProps) {
  const { colors, isMilitaryTime } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Animation values
  const bellShake = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  const dismissY = useRef(new Animated.Value(0)).current;
  const snoozeY = useRef(new Animated.Value(0)).current;

  // Time update effect
  useEffect(() => {
    if (!visible) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  // Sound and animation effects
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    const setupAlarm = async () => {
      try {
        // Load and play alarm sound
        await playAlarmSound();
        
        // Start vibration pattern
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Vibration.vibrate([1000, 1000, 1000], true);
        }

        // Start animations
        startAnimations();
      } catch (error) {
        console.error('Error setting up alarm:', error);
      }
    };

    setupAlarm();

    return () => {
      isMounted = false;
      stopAlarmSound();
      Vibration.cancel();
      stopAnimations();
    };
  }, [visible]);

  const playAlarmSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Set audio mode for alarm priority
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // IMPORTANT: Play even in silent mode
        shouldDuckAndroid: false,
        staysActiveInBackground: false,
      });

      // Get the appropriate sound URL based on alarm sound type
      const soundUrl = getAlarmSoundUrl(alarm.soundName || 'classic_bell');
      
      console.log('🔊 Playing alarm sound:', soundUrl);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        { 
          shouldPlay: true, 
          isLooping: true,
          volume: 1.0,
        }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      console.log('🔊 Alarm sound started successfully');
    } catch (error) {
      console.error('Error playing alarm sound:', error);
      // Fallback to system sound if custom sound fails
      setIsPlaying(true);
    }
  };

  const stopAlarmSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
    }
  };

  const getAlarmSoundUrl = (soundName: string): string => {
    // For better Expo Go compatibility, use more reliable sound URLs
    const soundUrls: { [key: string]: string } = {
      gentle_chimes: 'https://www2.cs.uic.edu/~i101/SoundFiles/Taunt.wav',
      soft_piano: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav',
      nature_sounds: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
      classic_bell: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
      peaceful_melody: 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav',
      morning_breeze: 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav',
      ocean_waves: 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav',
      forest_birds: 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav',
      wind_chimes: 'https://www2.cs.uic.edu/~i101/SoundFiles/tada.wav',
      rainfall: 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble.wav',
    };
    
    return soundUrls[soundName] || soundUrls.classic_bell;
  };

  const startAnimations = () => {
    // Bell shake animation
    const shakeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bellShake, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shakeAnimation.start();
    pulse.start();
  };

  const stopAnimations = () => {
    bellShake.stopAnimation();
    pulseAnimation.stopAnimation();
    swipeAnimation.stopAnimation();
  };

  // Swipe to dismiss gesture
  const dismissPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy < 0) {
        dismissY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -100) {
        // Swiped up enough to dismiss
        Animated.timing(dismissY, {
          toValue: -500,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          handleDismiss();
        });
      } else {
        // Snap back
        Animated.spring(dismissY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Swipe to snooze gesture
  const snoozePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        snoozeY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        // Swiped down enough to snooze
        Animated.timing(snoozeY, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          handleSnooze();
        });
      } else {
        // Snap back
        Animated.spring(snoozeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleDismiss = async () => {
    await stopAlarmSound();
    Vibration.cancel();
    stopAnimations();
    onDismiss();
  };

  const handleSnooze = async () => {
    await stopAlarmSound();
    Vibration.cancel();
    stopAnimations();
    // Default snooze for 5 minutes
    onSnooze(5);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: !isMilitaryTime 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!visible) return null;

  console.log('🚨 AlarmActiveScreen rendering with alarm:', alarm);

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleDismiss}
    >
      <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Current Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </View>

        {/* Big Alarm Bell */}
        <View style={styles.alarmContainer}>
          <Animated.View
            style={[
              styles.bellContainer,
              {
                transform: [
                  { translateX: bellShake },
                  { scale: pulseAnimation },
                ],
              },
            ]}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </Animated.View>
          
          <Text style={styles.alarmLabel}>{alarm.label || 'Alarm'}</Text>
          <Text style={styles.alarmTime}>{alarm.time}</Text>
        </View>

        {/* Dismiss Action (Swipe Up) */}
        <Animated.View
          style={[
            styles.dismissArea,
            {
              transform: [{ translateY: dismissY }],
            },
          ]}
          {...dismissPanResponder.panHandlers}
        >
          <View style={styles.actionContainer}>
            <Text style={styles.actionIcon}>⬆️</Text>
            <Text style={styles.actionText}>Swipe up to dismiss</Text>
            <TouchableOpacity style={styles.actionButton} onPress={handleDismiss}>
              <Text style={styles.actionButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Snooze Action (Swipe Down) */}
        <Animated.View
          style={[
            styles.snoozeArea,
            {
              transform: [{ translateY: snoozeY }],
            },
          ]}
          {...snoozePanResponder.panHandlers}
        >
          <View style={styles.actionContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.snoozeButton]} onPress={handleSnooze}>
              <Text style={styles.actionButtonText}>Snooze 5min</Text>
            </TouchableOpacity>
            <Text style={styles.actionText}>Swipe down to snooze</Text>
            <Text style={styles.actionIcon}>⬇️</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  timeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Montserrat-SemiBold',
  },
  currentDate: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 8,
    fontFamily: 'Montserrat-Regular',
  },
  alarmContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  bellContainer: {
    marginBottom: 30,
  },
  bellIcon: {
    fontSize: 120,
    textAlign: 'center',
  },
  alarmLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Montserrat-SemiBold',
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  dismissArea: {
    alignItems: 'center',
    padding: 20,
  },
  snoozeArea: {
    alignItems: 'center',
    padding: 20,
  },
  actionContainer: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  snoozeButton: {
    backgroundColor: colors.accent,
  },
  actionButtonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
  },
});