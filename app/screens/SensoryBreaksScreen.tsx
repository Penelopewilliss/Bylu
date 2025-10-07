import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import HomeButton from '../components/HomeButton';

export default function SensoryBreaksScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleHomePress = () => {
    navigation.navigate('Dashboard' as never);
  };

  return (
    <View style={styles.container}>
      <HomeButton onPress={handleHomePress} headerOverlay={true} />
      <Text style={styles.title}>🌸 Sensory Breaks</Text>
      <Text style={styles.subtitle}>Take a mindful moment</Text>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
});
