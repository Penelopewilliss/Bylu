import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Bell, Palette, Zap } from 'lucide-react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { isLoading } = useApp();
  const [notifications, setNotifications] = useState({ tasks: true, deadlines: true, focusTimer: true, dailyReminder: false });
  const [adhdMode, setAdhdMode] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings', headerStyle: { backgroundColor: Colors.white }, headerTintColor: Colors.text }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Bell size={20} color={Colors.primaryDark} /><Text style={styles.sectionTitle}>Notifications</Text></View>
          {Object.entries(notifications).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
              <Text style={styles.settingLabel}>{key}</Text>
              <Switch value={value} onValueChange={(val) => handleNotificationChange(key, val)} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Zap size={20} color={Colors.primaryDark} /><Text style={styles.sectionTitle}>ADHD Mode</Text></View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable ADHD Mode</Text>
            <Switch value={adhdMode} onValueChange={setAdhdMode} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Palette size={20} color={Colors.primaryDark} /><Text style={styles.sectionTitle}>Theme</Text></View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch value={theme === 'dark'} onValueChange={(val) => setTheme(val ? 'dark' : 'light')} />
          </View>
        </View>

        {isLoading && <Text style={styles.loading}>Loading...</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1, padding: 20 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.primaryDark, marginLeft: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  settingLabel: { fontSize: 16, color: Colors.text },
  loading: { textAlign: 'center', color: Colors.textLight, marginTop: 20 },
});
