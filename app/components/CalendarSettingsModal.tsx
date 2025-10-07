import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useCalendarSync } from '../context/CalendarSyncContext';
import { useTheme } from '../context/ThemeContext';

const CalendarSettingsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const {
    isConnected,
    isAuthenticating,
    isSyncing,
    syncEnabled,
    lastSyncTime,
    calendars,
    selectedCalendarId,
    syncStats,
    syncErrors,
    authenticateGoogle,
    disconnectGoogle,
    syncCalendar,
    enableSync,
    loadCalendars,
    selectCalendar,
    setSyncFrequency,
    getSyncConfig,
  } = useCalendarSync();

  const [syncFrequency, setSyncFrequencyLocal] = useState<'manual' | 'hourly' | 'daily'>('manual');

  useEffect(() => {
    if (visible && isConnected) {
      loadSyncConfig();
    }
  }, [visible, isConnected]);

  const loadSyncConfig = async () => {
    try {
      const config = await getSyncConfig();
      if (config) {
        setSyncFrequencyLocal(config.syncFrequency);
      }
    } catch (error) {
      console.error('Error loading sync config:', error);
    }
  };

  const handleConnect = async () => {
    try {
      const success = await authenticateGoogle();
      if (success) {
        Alert.alert(
          '✅ Connected!',
          'Google Calendar has been connected successfully. Your events will now sync automatically.',
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
      Alert.alert(
        '❌ Error',
        'An error occurred while connecting to Google Calendar.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      '🔌 Disconnect Google Calendar',
      'Are you sure you want to disconnect Google Calendar? Your local events will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectGoogle();
            Alert.alert('✅ Disconnected', 'Google Calendar has been disconnected.');
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    try {
      await syncCalendar();
      Alert.alert(
        '✅ Sync Complete',
        `Calendar sync completed!\n\n📥 Imported: ${syncStats.imported}\n📤 Exported: ${syncStats.exported}\n🔄 Updated: ${syncStats.updated}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Sync Failed',
        'Failed to sync calendar. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFrequencyChange = async (frequency: 'manual' | 'hourly' | 'daily') => {
    setSyncFrequencyLocal(frequency);
    await setSyncFrequency(frequency);
  };

  const formatLastSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📅 Google Calendar Sync</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Connection Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={[styles.statusBadge, isConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
                  <Text style={[styles.statusText, isConnected ? styles.connectedText : styles.disconnectedText]}>
                    {isConnected ? '✅ Connected' : '❌ Not Connected'}
                  </Text>
                </View>
              </View>
              
              {isConnected && (
                <>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Last Sync:</Text>
                    <Text style={styles.statusValue}>{formatLastSyncTime(lastSyncTime)}</Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Auto Sync:</Text>
                    <Switch
                      value={syncEnabled}
                      onValueChange={enableSync}
                      trackColor={{ false: colors.border, true: colors.accent }}
                      thumbColor={syncEnabled ? colors.primary : '#f4f3f4'}
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Connection Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            {!isConnected ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.connectButton]}
                onPress={handleConnect}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>🔗 Connect Google Calendar</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.syncButton]}
                  onPress={handleSyncNow}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>🔄 Sync Now</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={handleDisconnect}
                >
                  <Text style={styles.actionButtonText}>🔌 Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Sync Settings */}
          {isConnected && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sync Settings</Text>
              
              <View style={styles.settingCard}>
                <Text style={styles.settingLabel}>Sync Frequency</Text>
                <View style={styles.frequencyOptions}>
                  {(['manual', 'hourly', 'daily'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[
                        styles.frequencyOption,
                        syncFrequency === freq && styles.selectedFrequencyOption,
                      ]}
                      onPress={() => handleFrequencyChange(freq)}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          syncFrequency === freq && styles.selectedFrequencyText,
                        ]}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Sync Statistics */}
          {isConnected && lastSyncTime && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last Sync Results</Text>
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{syncStats.imported}</Text>
                  <Text style={styles.statLabel}>📥 Imported</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{syncStats.exported}</Text>
                  <Text style={styles.statLabel}>📤 Exported</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{syncStats.updated}</Text>
                  <Text style={styles.statLabel}>🔄 Updated</Text>
                </View>
              </View>
            </View>
          )}

          {/* Error Display */}
          {syncErrors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Sync Errors</Text>
              <View style={styles.errorCard}>
                {syncErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Help Text */}
          <View style={styles.section}>
            <Text style={styles.helpText}>
              💡 Google Calendar sync allows you to keep your events synchronized between this app and your Google Calendar. 
              Your events will be accessible across all your devices.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.buttonText,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  statusCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connectedBadge: {
    backgroundColor: '#E8F5E8',
  },
  disconnectedBadge: {
    backgroundColor: '#FFF2F2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectedText: {
    color: '#2E7D2E',
  },
  disconnectedText: {
    color: '#C53030',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectButton: {
    backgroundColor: colors.primary,
  },
  syncButton: {
    backgroundColor: colors.accent,
  },
  disconnectButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectedFrequencyOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  frequencyText: {
    fontSize: 14,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  selectedFrequencyText: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFF2F2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 14,
    color: '#C53030',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CalendarSettingsModal;