import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Home</Text>
          <Text style={styles.subtitle}>Welcome to your personal space</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>✨ Ready to make today amazing?</Text>
          <Text style={styles.welcomeSubtext}>
            This is your new home page - tell me what you'd like to see here!
          </Text>
        </View>

        {/* Placeholder content - you can customize this later */}
        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderTitle}>🎯 Coming Soon</Text>
          <Text style={styles.placeholderText}>
            This space is ready for your ideas! Let me know what features you'd like to add to your home page.
          </Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
  welcomeSection: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  placeholderSection: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
});