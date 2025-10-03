import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '../constants/colors';
import { Wind, Eye, Ear, Hand } from 'lucide-react-native';

export default function SensoryBreaksScreen() {
  const [selectedBreak, setSelectedBreak] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  };

  const breaks = [
    { id: 'breathing', title: 'Deep Breathing', icon: Wind, color: Colors.blue, description: 'Inhale for 4, hold for 4, exhale for 4', instructions: ['Find a comfortable position','Close your eyes if comfortable','Breathe in slowly through your nose for 4 counts','Hold your breath for 4 counts','Exhale slowly through your mouth for 4 counts','Repeat 5 times'] },
    { id: 'visual', title: 'Visual Rest', icon: Eye, color: Colors.purple, description: 'Give your eyes a break', instructions: ['Look away from your screen','Focus on something 20 feet away','Hold for 20 seconds','Blink slowly 10 times','Roll your eyes gently in circles','Repeat as needed'] },
    { id: 'sound', title: 'Sound Focus', icon: Ear, color: Colors.success, description: 'Listen mindfully', instructions: ['Close your eyes','Notice all the sounds around you','Identify 3 different sounds','Focus on each sound for 10 seconds','Notice how sounds come and go','Take a deep breath'] },
    { id: 'movement', title: 'Gentle Movement', icon: Hand, color: Colors.warning, description: 'Stretch and move', instructions: ['Stand up and stretch your arms overhead','Roll your shoulders back 5 times','Gently tilt your head side to side','Shake out your hands and arms','Take 3 deep breaths','Sit back down when ready'] },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sensory Breaks', headerStyle: { backgroundColor: Colors.white }, headerTintColor: Colors.text }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {breaks.map((breakItem) => {
          const Icon = breakItem.icon;
          const isSelected = selectedBreak === breakItem.id;
          return (
            <View key={breakItem.id} style={styles.breakSection}>
              <TouchableOpacity
                style={[styles.breakCard, { backgroundColor: breakItem.color }, isSelected && styles.breakCardSelected]}
                onPress={() => {
                  setSelectedBreak(isSelected ? null : breakItem.id);
                  if (!isSelected) startPulseAnimation();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.breakHeader}>
                  <Icon size={32} color={Colors.white} />
                  <View style={styles.breakTitleContainer}>
                    <Text style={styles.breakTitle}>{breakItem.title}</Text>
                    <Text style={styles.breakDescription}>{breakItem.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {isSelected && (
                <Animated.View style={[styles.instructionsContainer, { transform: [{ scale: pulseAnim }] }]}>\n                  {breakItem.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionRow}>
                      <View style={styles.instructionNumber}><Text style={styles.instructionNumberText}>{index + 1}</Text></View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </Animated.View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1, padding: 20 },
  breakSection: { marginBottom: 16 },
  breakCard: { borderRadius: 20, padding: 20 },
  breakCardSelected: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  breakHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  breakTitleContainer: { flex: 1 },
  breakTitle: { fontSize: 20, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  breakDescription: { fontSize: 14, color: Colors.white, opacity: 0.9 },
  instructionsContainer: { backgroundColor: Colors.secondary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, padding: 20, gap: 16 },
  instructionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  instructionNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  instructionNumberText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  instructionText: { flex: 1, fontSize: 15, color: Colors.text, lineHeight: 22 },
});
