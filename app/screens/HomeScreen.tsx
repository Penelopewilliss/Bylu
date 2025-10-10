import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
  onSetDeepLink?: (deepLink: any) => void;
}

export default function HomeScreen({ onNavigate, onSetDeepLink }: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
      emoji: '📅',
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.actionCard}
              onPress={action.action}
              activeOpacity={0.7}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    padding: 12,
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
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  actionCard: {
    backgroundColor: colors.cardBackground,
    width: '40%',
    aspectRatio: 1,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    paddingHorizontal: 4,
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
});