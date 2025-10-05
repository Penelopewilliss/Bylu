// DashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import Fonts from '../constants/fonts';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Tasks')}
      >
        <Text style={styles.cardText}>Tasks</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Calendar')}
      >
        <Text style={styles.cardText}>Calendar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('SensoryBreaks')}
      >
        <Text style={styles.cardText}>Sensory Breaks</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.cardText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: Colors.secondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardText: { fontSize: 18, fontWeight: '600', color: Colors.text },
});
