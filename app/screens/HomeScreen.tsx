import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import LottieView from 'lottie-react-native';
import ActionLottie from '../components/ActionLottie';
import CalendarIcon from '../components/CalendarIcon';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
  onSetDeepLink?: (deepLink: any) => void;
}

export default function HomeScreen({ onNavigate, onSetDeepLink }: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Floating particles animation
  const screenWidth = Dimensions.get('window').width;
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    animatedValue: useRef(new Animated.Value(0)).current,
    xPosition: Math.random() * screenWidth,
    delay: i * 800,
  }));

  useEffect(() => {
    particles.forEach((particle) => {
      const animate = () => {
        particle.animatedValue.setValue(0);
        Animated.timing(particle.animatedValue, {
          toValue: 1,
          duration: 4000 + Math.random() * 2000, // Random duration between 4-6 seconds
          useNativeDriver: true,
        }).start(() => {
          setTimeout(animate, Math.random() * 3000); // Random delay before next animation
        });
      };

      setTimeout(animate, particle.delay);
    });
  }, []);

  const navigateWithModal = (screen: string, modalType: string) => {
    if (onSetDeepLink) {
      onSetDeepLink({ type: modalType });
    }
    onNavigate?.(screen);
  };

  const quickActions = [
    {
      title: 'Go to Dashboard',
      emoji: '🦋',
      description: 'View your overview',
      action: () => onNavigate?.('Dashboard'),
      color: '#8B5CF6'
    },
    {
      title: 'Add Appointment',
      customIcon: 'calendar',
      description: 'Create calendar event',
      action: () => navigateWithModal('Calendar', 'add-appointment'),
      color: '#4ECDC4'
    },
    {
      title: 'Add Task',
      emoji: '🌺',
      description: 'Create a new task',
      action: () => navigateWithModal('Tasks', 'add-task'),
      color: '#DDA0DD'
    },
    {
      title: 'Add Goal',
      emoji: '✨',
      description: 'Set a new goal',
      action: () => navigateWithModal('Goals', 'add-goal'),
      color: '#FFEAA7'
    },
    {
      title: 'Add Thought',
      emoji: '💭',
      description: 'Capture an idea',
      action: () => navigateWithModal('BrainDump', 'add-thought'),
      color: '#45B7D1'
    },
    {
      title: 'Add Voice Memo',
      emoji: '🎤',
      description: 'Record audio note',
      action: () => navigateWithModal('BrainDump', 'add-voice-memo'),
      color: '#96CEB4'
    },
    {
      title: 'Set Alarm',
      emoji: '⏰',
      description: 'Schedule a new alarm',
      action: () => navigateWithModal('AlarmClock', 'add-alarm'),
      color: '#FF6B6B'
    },
    {
      title: 'Go to Settings',
      emoji: '🌸',
      description: 'Manage your preferences',
      action: () => onNavigate?.('Settings'),
      color: '#F8BBD9'
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Theme-aware background */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background }]} />
      
      {/* 🎨 Full Screen Lottie Background Animation */}
      <View style={StyleSheet.absoluteFillObject}>
        <LottieView
          source={require('../../assets/lottie/floating-animation.json')}
          autoPlay
          loop
          speed={0.3}
          style={{
            flex: 1,
            opacity: 0.2,
          }}
          resizeMode="cover"
        />
      </View>
      
      <ScrollView style={[styles.content, { zIndex: 10 }]} showsVerticalScrollIndicator={false}>
        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Pressable 
              key={index}
              onPress={action.action}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  // Subtle press effect
                  transform: pressed 
                    ? [{ scale: 0.95 }]
                    : [{ scale: 1 }],
                  // Clean shadow for depth
                  shadowColor: '#000',
                  shadowOffset: pressed 
                    ? { width: 0, height: 4 }
                    : { width: 0, height: 8 },
                  shadowOpacity: pressed ? 0.15 : 0.25,
                  shadowRadius: pressed ? 6 : 12,
                  elevation: pressed ? 4 : 8,
                }
              ]}
            >
              {/* Inner Container */}
              <View style={{
                flex: 1,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 24,
              }}>
                {(action as any).animation ? (
                  <ActionLottie source={(action as any).animation} size={36} speed={1} />
                ) : (action as any).customIcon === 'calendar' ? (
                  <CalendarIcon size={36} color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionEmoji}>{(action as any).emoji}</Text>
                )}
                <Text style={styles.actionTitle}>{action.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  actionsGrid: {
    marginBottom: 30,
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    zIndex: 5, // Ensure grid is above background
  },
  actionCard: {
    backgroundColor: '#E8B4C4',
    width: '40%',
    aspectRatio: 1,
    borderRadius: 28,
    marginBottom: 20,
    // Subtle 3D border effect
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    overflow: 'hidden',
  },
  actionHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  actionEmoji: {
    fontSize: 36,
    marginBottom: 10,
    // Subtle shadow for depth
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  actionTitle: {
    fontSize: 14, // Slightly larger text for better readability
    fontWeight: '700', // Bolder text
    color: '#FFFFFF', // White text for contrast on pink cards
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    paddingHorizontal: 6,
    // Enhanced text shadow for stronger 3D effect
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.8, // Better spacing for 3D appearance
  },
  welcomeSection: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  particlesContainer: {
    position: 'absolute',
    bottom: -50, // Move even lower, below the visible area
    left: 0,
    right: 0,
    height: 150, // Smaller height for more focused bottom animation
    pointerEvents: 'none', // Allow touch events to pass through
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary || '#8B5CF6',
    opacity: 0.6,
  },
});
