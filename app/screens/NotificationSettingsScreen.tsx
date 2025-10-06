import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import NotificationService, { NotificationSettings } from '../services/NotificationService';

const TIMING_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 1440, label: '1 day' },
];

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    timings: [15, 60],
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await notificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await notificationService.updateSettings(updatedSettings);
  };

  const toggleTiming = async (timing: number) => {
    const newTimings = settings.timings.includes(timing)
      ? settings.timings.filter(t => t !== timing)
      : [...settings.timings, timing].sort((a, b) => a - b);
    
    await updateSettings({ timings: newTimings });
  };

  const testNotification = async () => {
    const hasPermission = await notificationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        '🔒 Permission Required',
        'Please enable notifications in your device settings to receive appointment reminders.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    await notificationService.testNotification();
    Alert.alert(
      '💕 Test Sent!',
      'You should receive a test notification in a few seconds.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const requestPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    if (granted) {
      Alert.alert(
        '✅ Permissions Granted',
        'You will now receive appointment notifications!',
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        '❌ Permissions Denied',
        'Please enable notifications in your device settings to receive appointment reminders.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔔 Notification Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your appointment reminders</Text>
        </View>

        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Get reminders for upcoming appointments
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(enabled) => updateSettings({ enabled })}
              trackColor={{ false: '#E0E0E0', true: '#FF69B4' }}
              thumbColor={settings.enabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Subtle Permission Check */}
        <View style={styles.permissionHint}>
          <Text style={styles.permissionHintText}>
            Not receiving notifications?{' '}
            <Text style={styles.permissionLink} onPress={requestPermissions}>
              Check permissions
            </Text>
          </Text>
        </View>

        {settings.enabled && (
          <>
            {/* Timing Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏰ When to Remind Me</Text>
              <Text style={styles.sectionSubtitle}>
                Choose when you want to be notified before your appointments
              </Text>
              
              <View style={styles.timingGrid}>
                {TIMING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timingOption,
                      settings.timings.includes(option.value) && styles.timingOptionSelected,
                    ]}
                    onPress={() => toggleTiming(option.value)}
                  >
                    <Text
                      style={[
                        styles.timingOptionText,
                        settings.timings.includes(option.value) && styles.timingOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sound & Vibration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎵 Sound & Vibration</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Sound</Text>
                  <Text style={styles.settingDescription}>
                    Play a sound with notifications
                  </Text>
                </View>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(soundEnabled) => updateSettings({ soundEnabled })}
                  trackColor={{ false: '#E0E0E0', true: '#FF69B4' }}
                  thumbColor={settings.soundEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Vibration</Text>
                  <Text style={styles.settingDescription}>
                    Vibrate when notifications arrive
                  </Text>
                </View>
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
                  trackColor={{ false: '#E0E0E0', true: '#FF69B4' }}
                  thumbColor={settings.vibrationEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Test Notification */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                <Text style={styles.testButtonText}>🧪 Send Test Notification</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'System',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'System',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'System',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  timingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timingOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minWidth: 100,
    alignItems: 'center',
  },
  timingOptionSelected: {
    borderColor: '#FF69B4',
    backgroundColor: '#FF69B4',
  },
  timingOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'System',
  },
  timingOptionTextSelected: {
    color: '#FFFFFF',
  },
  permissionHint: {
    marginTop: 8,
    alignItems: 'center',
  },
  permissionHintText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'System',
    textAlign: 'center',
  },
  permissionLink: {
    color: '#FF69B4',
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});