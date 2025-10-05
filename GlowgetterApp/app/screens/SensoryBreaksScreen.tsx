import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SensoryBreaksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>�� Sensory Breaks</Text>
      <Text style={styles.subtitle}>Take a mindful moment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7D1DA',
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
