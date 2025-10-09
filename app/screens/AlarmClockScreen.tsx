import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import HomeButton from '../components/HomeButton';

interface AlarmClockScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function AlarmClockScreen({ onNavigate }: AlarmClockScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleHomePress = () => {
    if (onNavigate) {
      onNavigate('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HomeButton onPress={handleHomePress} headerOverlay={true} />
      
      <View style={styles.content}>
        <Text style={styles.title}>⏰ Alarm Clock</Text>
        <Text style={styles.subtitle}>Set your perfect wake-up call</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>🌸 Coming Soon! 🌸</Text>
          <Text style={styles.placeholderSubtext}>
            Your beautiful alarm clock features will be built here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text || '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary || '#666',
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'System',
  },
  placeholder: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F7D1DA',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'System',
    lineHeight: 22,
  },
});