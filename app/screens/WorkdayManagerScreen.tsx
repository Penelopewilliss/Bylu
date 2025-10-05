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
  sessionCard: {
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
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

const WorkdayManagerScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workday Manager</Text>
      <View style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>Morning Session</Text>
        <Text style={styles.sessionDescription}>Plan your tasks and set your goals for the day.</Text>
      </View>
      <View style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>Afternoon Session</Text>
        <Text style={styles.sessionDescription}>Review progress and adjust your workflow as needed.</Text>
      </View>
    </View>
  );
};

export default WorkdayManagerScreen;
