import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to your dashboard!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6B6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
});
