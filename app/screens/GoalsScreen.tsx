import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

const GoalsScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Goals</Text>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Finish React Native App</Text>
        <Text style={styles.goalDescription}>Complete all screens and polish the UI for launch.</Text>
      </View>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Implement Dark Mode</Text>
        <Text style={styles.goalDescription}>Make sure all screens support dark mode and theme switching.</Text>
      </View>
    </View>
  );
};

export default GoalsScreen;
