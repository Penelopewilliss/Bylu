import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Switch,
  Alert,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useCalendarSync } from '../context/CalendarSyncContext';
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';
import NotificationService from '../services/NotificationService';

export default function SettingsScreen() {
  const { isDarkMode, isMilitaryTime, colors, toggleDarkMode, toggleMilitaryTime } = useTheme();
  const { 
    isConnected, 
    isAuthenticating, 
    isSyncing, 
    syncEnabled, 
    lastSyncTime,
    authenticateGoogle, 
    disconnectGoogle, 
    syncCalendar, 
    enableSync 
  } = useCalendarSync();

  const styles = createStyles(colors);

  const resetOnboarding = async () => {
    try {
      console.log('🔄 Resetting onboarding...');
      await AsyncStorage.removeItem('@planner_onboarding_completed');
      console.log('✅ Onboarding reset successfully');
      Alert.alert(
        'Onboarding Reset',
        'Please restart the app to see the onboarding flow.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      Alert.alert('Error', 'Failed to reset onboarding');
    }
  };

  const testNotification = async () => {
    try {
      console.log('🔔 Testing notification...');
      const notificationService = NotificationService.getInstance();
      
      // Request permissions first
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          '❌ Permission Required',
          'Please allow notifications to test your pink flower icon!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Send test notification
      await notificationService.testNotification();
      
      Alert.alert(
        '🌸 Test Notification Sent!',
        'Check your notification bar for your beautiful pink flower icon!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing notification:', error);
      Alert.alert(
        '❌ Error',
        'Failed to send test notification. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const success = await authenticateGoogle();
      if (success) {
        Alert.alert(
          '✅ Connected!',
          'Successfully connected to Google Calendar. Your appointments will now sync automatically.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Connection Failed',
          'Failed to connect to Google Calendar. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      Alert.alert(
        '❌ Error',
        'An error occurred while connecting to Google Calendar.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoogleDisconnect = async () => {
    Alert.alert(
      '🔌 Disconnect Google Calendar',
      'Are you sure you want to disconnect from Google Calendar? Your local appointments will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectGoogle();
              Alert.alert(
                '✅ Disconnected',
                'Successfully disconnected from Google Calendar.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error disconnecting Google Calendar:', error);
              Alert.alert('Error', 'Failed to disconnect from Google Calendar.');
            }
          }
        }
      ]
    );
  };

  const handleSyncNow = async () => {
    try {
      await syncCalendar();
      Alert.alert(
        '✅ Sync Complete',
        `Calendar synced successfully at ${new Date().toLocaleTimeString()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error syncing calendar:', error);
      Alert.alert('Error', 'Failed to sync calendar. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      </View>

      {/* Settings Options */}
      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Toggle between light and dark theme</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? colors.background : colors.textLight}
            />
          </View>
        </View>

        {/* Time & Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time & Date</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>24-Hour Time</Text>
              <Text style={styles.settingDescription}>Use military time format (13:00 instead of 1:00 PM)</Text>
            </View>
            <Switch
              value={isMilitaryTime}
              onValueChange={toggleMilitaryTime}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isMilitaryTime ? colors.background : colors.textLight}
            />
          </View>
        </View>

        {/* Google Calendar Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Google Calendar Sync {GOOGLE_CALENDAR_CONFIG.DEMO_MODE ? '(Demo Mode)' : ''}</Text>
          
          {GOOGLE_CALENDAR_CONFIG.DEMO_MODE && (
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🎭 Demo Mode Active</Text>
                <Text style={styles.settingDescription}>
                  Running in demo mode - no Google account required! Try the sync features with sample data.
                </Text>
              </View>
              <Text style={styles.chevron}>🎪</Text>
            </View>
          )}
          
          {isConnected ? (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>✅ {GOOGLE_CALENDAR_CONFIG.DEMO_MODE ? 'Demo Connected' : 'Connected'}</Text>
                  <Text style={styles.settingDescription}>
                    {GOOGLE_CALENDAR_CONFIG.DEMO_MODE 
                      ? 'Demo calendar is active with sample events and sync functionality'
                      : 'Your Google Calendar is synced and appointments will appear automatically'
                    }
                  </Text>
                </View>
                <Text style={styles.chevron}>🟢</Text>
              </View>
              
              <TouchableOpacity style={styles.settingItem} onPress={handleSyncNow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔄 {GOOGLE_CALENDAR_CONFIG.DEMO_MODE ? 'Demo Sync' : 'Sync Now'}</Text>
                  <Text style={styles.settingDescription}>
                    {GOOGLE_CALENDAR_CONFIG.DEMO_MODE 
                      ? 'Test the sync functionality with demo events'
                      : 'Manually sync your calendar events'
                    }
                  </Text>
                </View>
                <Text style={styles.chevron}>⚡</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem} onPress={handleGoogleDisconnect}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🔌 Disconnect</Text>
                  <Text style={styles.settingDescription}>
                    {GOOGLE_CALENDAR_CONFIG.DEMO_MODE 
                      ? 'Disconnect from demo calendar'
                      : 'Stop syncing with Google Calendar'
                    }
                  </Text>
                </View>
                <Text style={styles.chevron}>❌</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.settingItem} onPress={handleGoogleSignIn}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>🔗 {GOOGLE_CALENDAR_CONFIG.DEMO_MODE ? 'Try Demo Calendar' : 'Connect Google Calendar'}</Text>
                <Text style={styles.settingDescription}>
                  {GOOGLE_CALENDAR_CONFIG.DEMO_MODE 
                    ? 'Test calendar sync with demo data - no Google account needed!'
                    : 'Sync your appointments and events automatically'
                  }
                </Text>
              </View>
              <Text style={styles.chevron}>{isAuthenticating ? '⏳' : '→'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={testNotification}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>🌸 Test Notification</Text>
              <Text style={styles.settingDescription}>Test your beautiful pink flower notification icon</Text>
            </View>
            <Text style={styles.chevron}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={resetOnboarding}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reset Onboarding</Text>
              <Text style={styles.settingDescription}>Clear onboarding state to see the welcome flow again</Text>
            </View>
            <Text style={styles.chevron}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2025.10.05</Text>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
