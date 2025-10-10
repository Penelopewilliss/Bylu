import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated, Vibration, Platform } from 'react-native';
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

export default function AlarmActiveScreen({ alarm, onDismiss, onSnooze, visible }: AlarmActiveScreenProps) {
  const { colors } = useTheme();
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

      // Get the appropriate sound URL based on alarm sound type
      const soundUrl = getAlarmSoundUrl(alarm.soundName || 'gentle_chimes');
      
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
    // These would be actual sound file URLs or local assets
    const soundUrls: { [key: string]: string } = {
      gentle_chimes: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      soft_piano: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
      nature_sounds: 'https://www.soundjay.com/nature/sounds/forest-1.wav',
      classic_bell: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
      peaceful_melody: 'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav',
      morning_breeze: 'https://www.soundjay.com/nature/sounds/wind-1.wav',
      ocean_waves: 'https://www.soundjay.com/nature/sounds/ocean-1.wav',
      forest_birds: 'https://www.soundjay.com/nature/sounds/birds-1.wav',
      wind_chimes: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
      rainfall: 'https://www.soundjay.com/nature/sounds/rain-1.wav',
    };
    
    return soundUrls[soundName] || soundUrls.gentle_chimes;
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
      hour12: true 
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

  const styles = createStyles(colors);

  return (
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