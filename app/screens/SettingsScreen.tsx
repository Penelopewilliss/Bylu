import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Modal,
  Platform,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useCalendarSync } from '../context/CalendarSyncContext';
import OfflineIndicator from '../components/OfflineIndicator';
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';
import NotificationService, { PriorityReminderSettings, DailyAppointmentSettings } from '../services/NotificationService';
import Button3D from '../components/Button3D';

export default function SettingsScreen() {
  const { isDarkMode, isMilitaryTime, colors, toggleDarkMode, toggleMilitaryTime, formatTime } = useTheme();
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

  const [priorityReminderSettings, setPriorityReminderSettings] = useState<PriorityReminderSettings>({
    enabled: true,
    morningEnabled: true,
    lunchEnabled: false,
    eveningEnabled: false,
    morningTime: { hour: 9, minute: 0 },
    lunchTime: { hour: 13, minute: 0 },
    eveningTime: { hour: 18, minute: 0 },
  });

  const [dailyAppointmentSettings, setDailyAppointmentSettings] = useState<DailyAppointmentSettings>({
    enabled: true,
    morningEnabled: true,
    eveningEnabled: true,
    morningTime: { hour: 8, minute: 0 },
    eveningTime: { hour: 20, minute: 0 },
  });

  // Time picker modal state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeType, setCurrentTimeType] = useState<'morning' | 'evening'>('morning');
  const [tempTime, setTempTime] = useState(new Date());

  const styles = createStyles(colors);

  // Load priority reminder settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        const prioritySettings = notificationService.getPriorityReminderSettings();
        const dailySettings = notificationService.getDailyAppointmentSettings();
        setPriorityReminderSettings(prioritySettings);
        setDailyAppointmentSettings(dailySettings);
        console.log(`⚙️ SettingsScreen: Loaded notification settings`);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  const updatePriorityReminderSetting = async (key: keyof PriorityReminderSettings, value: any) => {
    try {
      console.log(`⚙️ SettingsScreen: Updating ${key} to ${value}`);
      const newSettings = { ...priorityReminderSettings, [key]: value };
      setPriorityReminderSettings(newSettings);
      
      const notificationService = NotificationService.getInstance();
      await notificationService.updatePriorityReminderSettings(newSettings);
      
      console.log(`✅ SettingsScreen: Updated priority reminder setting: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to update priority reminder settings:', error);
      Alert.alert('Error', 'Failed to update reminder settings');
    }
  };

  const updateDailyAppointmentSetting = async (key: keyof DailyAppointmentSettings, value: any) => {
    try {
      console.log(`⚙️ SettingsScreen: Updating daily appointment ${key} to ${value}`);
      const newSettings = { ...dailyAppointmentSettings, [key]: value };
      setDailyAppointmentSettings(newSettings);
      
      const notificationService = NotificationService.getInstance();
      await notificationService.setDailyAppointmentSettings(newSettings);
      
      console.log(`✅ SettingsScreen: Updated daily appointment setting: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to update daily appointment settings:', error);
      Alert.alert('Error', 'Failed to update daily appointment settings');
    }
  };

  const showTimePickerModal = (
    type: 'morning' | 'evening',
    currentTime: { hour: number; minute: number }
  ) => {
    const date = new Date();
    date.setHours(currentTime.hour);
    date.setMinutes(currentTime.minute);
    setTempTime(date);
    setCurrentTimeType(type);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  const confirmTimeSelection = () => {
    const newTime = {
      hour: tempTime.getHours(),
      minute: tempTime.getMinutes(),
    };
    updateDailyAppointmentSetting(`${currentTimeType}Time` as keyof DailyAppointmentSettings, newTime);
    setShowTimePicker(false);
  };

  const cancelTimeSelection = () => {
    setShowTimePicker(false);
  };

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

  const testPriorityReminder = async () => {
    try {
      console.log('⚡ Testing priority reminder...');
      const notificationService = NotificationService.getInstance();
      
      // Request permissions first
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          '❌ Permission Required',
          'Please allow notifications to test priority reminders!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Send test priority reminder
      await notificationService.testPriorityReminder();
      
      Alert.alert(
        '⚡ Priority Reminder Sent!',
        'Check your notification bar for your priority task reminder!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing priority reminder:', error);
      Alert.alert(
        '❌ Error',
        'Failed to send test priority reminder. Please try again.',
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

        {/* Sync Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          <View style={styles.syncStatusContainer}>
            <OfflineIndicator style={styles.subtleOfflineIndicator} />
          </View>
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

          <TouchableOpacity style={styles.settingItem} onPress={testPriorityReminder}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>⚡ Test Priority Reminder</Text>
              <Text style={styles.settingDescription}>Test your priority task reminder notification</Text>
            </View>
            <Text style={styles.chevron}>⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Priority Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Priority Reminders</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Reminders</Text>
              <Text style={styles.settingDescription}>Daily reminders for your priority tasks</Text>
            </View>
            <Switch
              value={priorityReminderSettings.enabled}
              onValueChange={(value) => updatePriorityReminderSetting('enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={priorityReminderSettings.enabled ? colors.background : colors.textLight}
            />
          </View>

          {priorityReminderSettings.enabled && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌅 Morning ({formatTime(priorityReminderSettings.morningTime.hour, priorityReminderSettings.morningTime.minute)})</Text>
                  <Text style={styles.settingDescription}>Start your day with priority focus</Text>
                </View>
                <Switch
                  value={priorityReminderSettings.morningEnabled}
                  onValueChange={(value) => updatePriorityReminderSetting('morningEnabled', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={priorityReminderSettings.morningEnabled ? colors.background : colors.textLight}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🍽️ Lunch ({formatTime(priorityReminderSettings.lunchTime.hour, priorityReminderSettings.lunchTime.minute)})</Text>
                  <Text style={styles.settingDescription}>Midday priority check-in</Text>
                </View>
                <Switch
                  value={priorityReminderSettings.lunchEnabled}
                  onValueChange={(value) => updatePriorityReminderSetting('lunchEnabled', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={priorityReminderSettings.lunchEnabled ? colors.background : colors.textLight}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌆 Evening ({formatTime(priorityReminderSettings.eveningTime.hour, priorityReminderSettings.eveningTime.minute)})</Text>
                  <Text style={styles.settingDescription}>End-of-day priority review</Text>
                </View>
                <Switch
                  value={priorityReminderSettings.eveningEnabled}
                  onValueChange={(value) => updatePriorityReminderSetting('eveningEnabled', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={priorityReminderSettings.eveningEnabled ? colors.background : colors.textLight}
                />
              </View>
            </>
          )}
        </View>

        {/* Daily Appointment Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Daily Appointment Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Daily Summaries</Text>
              <Text style={styles.settingDescription}>Get daily previews of your appointments</Text>
            </View>
            <Switch
              value={dailyAppointmentSettings.enabled}
              onValueChange={(value) => updateDailyAppointmentSetting('enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={dailyAppointmentSettings.enabled ? colors.background : colors.textLight}
            />
          </View>

          {dailyAppointmentSettings.enabled && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌅 Morning Preview</Text>
                  <Text style={styles.settingDescription}>Today's appointments each morning</Text>
                </View>
                <Switch
                  value={dailyAppointmentSettings.morningEnabled}
                  onValueChange={(value) => updateDailyAppointmentSetting('morningEnabled', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={dailyAppointmentSettings.morningEnabled ? colors.background : colors.textLight}
                />
              </View>

              {dailyAppointmentSettings.morningEnabled && (
                <TouchableOpacity 
                  style={styles.timePickerItem}
                  onPress={() => showTimePickerModal('morning', dailyAppointmentSettings.morningTime)}
                >
                  <Text style={styles.timePickerLabel}>Morning Time:</Text>
                  <Text style={styles.timePickerValue}>
                    {formatTime(dailyAppointmentSettings.morningTime.hour, dailyAppointmentSettings.morningTime.minute)}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>🌆 Evening Preview</Text>
                  <Text style={styles.settingDescription}>Tomorrow's appointments each evening</Text>
                </View>
                <Switch
                  value={dailyAppointmentSettings.eveningEnabled}
                  onValueChange={(value) => updateDailyAppointmentSetting('eveningEnabled', value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={dailyAppointmentSettings.eveningEnabled ? colors.background : colors.textLight}
                />
              </View>

              {dailyAppointmentSettings.eveningEnabled && (
                <TouchableOpacity 
                  style={styles.timePickerItem}
                  onPress={() => showTimePickerModal('evening', dailyAppointmentSettings.eveningTime)}
                >
                  <Text style={styles.timePickerLabel}>Evening Time:</Text>
                  <Text style={styles.timePickerValue}>
                    {formatTime(dailyAppointmentSettings.eveningTime.hour, dailyAppointmentSettings.eveningTime.minute)}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
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

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelTimeSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Set {currentTimeType} notification time
              </Text>
            </View>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.customTimePickerContainer}>
                <View style={styles.customTimePicker}>
                  <Text style={styles.customTimePickerLabel}>Hour</Text>
                  <ScrollView 
                    style={styles.timeScrollView} 
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeOption,
                          tempTime.getHours() === hour && styles.selectedTimeOption
                        ]}
                        onPress={() => {
                          const newTime = new Date(tempTime);
                          newTime.setHours(hour);
                          setTempTime(newTime);
                        }}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          tempTime.getHours() === hour && styles.selectedTimeOptionText
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.customTimePicker}>
                  <Text style={styles.customTimePickerLabel}>Minutes</Text>
                  <ScrollView 
                    style={styles.timeScrollView} 
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeOption,
                          tempTime.getMinutes() === minute && styles.selectedTimeOption
                        ]}
                        onPress={() => {
                          const newTime = new Date(tempTime);
                          newTime.setMinutes(minute);
                          setTempTime(newTime);
                        }}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          tempTime.getMinutes() === minute && styles.selectedTimeOptionText
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              {/* Current time display */}
              <Text style={styles.currentTimeText}>
                Selected: {tempTime.getHours().toString().padStart(2, '0')}:
                {tempTime.getMinutes().toString().padStart(2, '0')}
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <Button3D
                title="Cancel"
                onPress={cancelTimeSelection}
                backgroundColor="#FFFFFF"
                textColor="#000000"
                style={{ flex: 1, marginRight: 0.5, borderTopLeftRadius: 0, borderBottomLeftRadius: 20, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              
              <Button3D
                title="Set Time"
                onPress={confirmTimeSelection}
                backgroundColor="#E8B4C4"
                textColor="#000000"
                style={{ flex: 1, marginLeft: 0.5, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 20 }}
              />
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    textAlign: 'center',
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
  syncStatusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtleOfflineIndicator: {
    transform: [{ scale: 0.85 }], // Make it smaller
    opacity: 0.8, // Make it more subtle
    marginHorizontal: 0, // Remove extra margins
    marginVertical: 0,
    shadowOpacity: 0.05, // Reduce shadow
    elevation: 1, // Reduce elevation
  },
  timePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  timePickerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timePickerValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // More dramatic overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBackground, // Use theme card background like normal screens
    borderRadius: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    // Enhanced 3D effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderTopColor: '#F0C7D1',
    borderBottomColor: '#D1A1B1',
    borderLeftColor: '#F0C7D1',
    borderRightColor: '#D1A1B1',
    transform: [{ perspective: 1000 }, { rotateX: '2deg' }],
  },
  modalHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D1A1B1',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#E8B4C4', // Keep pink header
    // 3D header effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000', // Black text for consistency
    textAlign: 'center',
    // 3D text effects
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  timePickerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'transparent',
  },
  currentTimeText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  // Custom scrollable time picker styles (from CalendarScreen)
  customTimePickerContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  customTimePicker: {
    flex: 1,
    alignItems: 'center',
  },
  customTimePickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeScrollView: {
    height: 200,
    width: '100%',
    paddingVertical: 10,
  },
  timeScrollContent: {
    paddingVertical: 10,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: colors.buttonText,
    fontWeight: '600',
  },
  webTimeInputContainer: {
    alignItems: 'center',
    width: '100%',
  },
  webTimeLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    fontWeight: '500',
  },
  webTimeInput: {
    width: 120,
    height: 50,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'monospace',
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // 3D button effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#D1A1B1',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderTopColor: '#F0F0F0',
    borderBottomColor: '#D0D0D0',
    borderLeftColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#E8B4C4',
    borderBottomRightRadius: 20,
    borderTopColor: '#F0C7D1',
    borderBottomColor: '#D1A1B1',
    borderRightColor: '#D1A1B1',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  confirmButtonText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
});
