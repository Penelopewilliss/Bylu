import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput, PanResponder, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { AlarmNotificationService } from '../services/AlarmNotificationService';
import Button3D from '../components/Button3D';
import type { Alarm } from '../types';
import { SOUND_FILES, getSoundFile } from '../config/sounds';

interface AlarmClockScreenProps {
  onNavigate?: (screen: string) => void;
  deepLink?: any;
  onDeepLinkHandled?: () => void;
}

export default function AlarmClockScreen({ onNavigate, deepLink, onDeepLinkHandled }: AlarmClockScreenProps) {
  const { colors, isMilitaryTime } = useTheme();
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useApp();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [newAlarmHour, setNewAlarmHour] = useState(7);
  const [newAlarmMinute, setNewAlarmMinute] = useState(0);
  const [newAlarmAmPm, setNewAlarmAmPm] = useState<'AM' | 'PM'>('AM');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeInterval, setSnoozeInterval] = useState(5);
  const [selectedSound, setSelectedSound] = useState('gentle_chimes');
  const [quickAlarmSound, setQuickAlarmSound] = useState('bell');
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const [currentPlayingSound, setCurrentPlayingSound] = useState<Audio.Sound | null>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  
  // Handle deep link to open add modal
  useEffect(() => {
    if (deepLink?.type === 'add-alarm') {
      setShowAddModal(true);
      onDeepLinkHandled?.();
    }
  }, [deepLink]);
  
  // PanResponder for swipe to close modal (down swipe only, in header area)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only start gesture if it's in the header area (top 80px of modal)
      const { pageY } = evt.nativeEvent;
      const modalTop = 100; // Approximate modal top position
      return pageY < modalTop + 80; // Only allow gestures in header area
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only activate for clear downward swipes
      const { dx, dy } = gestureState;
      return dy > 20 && Math.abs(dx) < Math.abs(dy); // Down swipe with minimal horizontal movement
    },
    onPanResponderGrant: () => {
      // Stop any playing sounds when starting swipe
      stopPreviewSound();
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Close modal only if swiped down more than 80px
      const { dy } = gestureState;
      if (dy > 80) {
        handleCancelModal();
      }
    },
    onPanResponderTerminationRequest: () => false, // Don't allow termination
  });
  
  const styles = createStyles(colors);

  const alarmSounds = [
    // Epic & Motivational 🌟
    { key: 'cosmic_awakening', name: '🌌 Cosmic Awakening', description: 'Ethereal space sounds building to inspiration', duration: 4000 },
    { key: 'champion_rise', name: '🏆 Champion Rise', description: 'Heroic orchestral theme for ambitious mornings', duration: 3500 },
    { key: 'power_surge', name: '⚡ Power Surge', description: 'Energizing electronic beats with uplifting melody', duration: 3000 },
    
    // Musical & Melodic 🎵
    { key: 'crystal_harmony', name: '💎 Crystal Harmony', description: 'Beautiful crystal bowl harmonics', duration: 4000 },
    { key: 'royal_fanfare', name: '👑 Royal Fanfare', description: 'Majestic brass fanfare fit for royalty', duration: 3000 },
    { key: 'zen_bells', name: '🧘 Zen Bells', description: 'Peaceful temple bells with reverb', duration: 3500 },
    
    // Nature & Ambient 🌊  
    { key: 'mystic_forest', name: '🧚 Mystic Forest', description: 'Enchanted forest with magical undertones', duration: 4000 },
    { key: 'ocean_sunrise', name: '🌅 Ocean Sunrise', description: 'Gentle waves with morning birds', duration: 3500 },
    { key: 'mountain_breeze', name: '��️ Mountain Breeze', description: 'Wind through trees with distant chimes', duration: 3000 },
    
    // Modern & Tech ⚡
    { key: 'future_pulse', name: '🚀 Future Pulse', description: 'Futuristic sci-fi awakening sequence', duration: 3000 },
    { key: 'digital_dawn', name: '🌐 Digital Dawn', description: 'Clean modern tones with building energy', duration: 3500 },
    { key: 'quantum_chime', name: '⚛️ Quantum Chime', description: 'Crystalline digital harmonics', duration: 2500 },
    
    // Classic Options 🔔
    { key: 'gentle_chimes', name: '🎐 Gentle Chimes', description: 'Soft and peaceful traditional', duration: 3000 },
    { key: 'soft_piano', name: '🎹 Soft Piano', description: 'Melodic and calming piano', duration: 3000 },
    { key: 'classic_bell', name: '🔔 Classic Bell', description: 'Traditional alarm bell', duration: 2000 },
    
    // Funny & Hilarious 😂
    { key: 'rooster_opera', name: '🐓 Rooster Opera', description: 'Dramatic rooster performing opera - absolutely hilarious!', duration: 4000 },
    { key: 'alien_invasion', name: '👽 Alien Invasion', description: 'Funny alien sounds: "WAKE UP HUMAN!"', duration: 3500 },
    { key: 'grandmother_yelling', name: '👵 Grandma Yelling', description: 'Sweet grandma shouting "GET UP HONEY!"', duration: 3000 },
    { key: 'cat_piano', name: '🐱 Cat Piano', description: 'Cats meowing a silly tune on piano keys', duration: 3500 },
    { key: 'rubber_duck', name: '🦆 Rubber Duck', description: 'Squeaky rubber duck having a meltdown', duration: 2500 },
    { key: 'pirate_wake_up', name: '🏴‍☠️ Pirate Wake Up', description: 'Gruff pirate: "AHOY! TIME TO WAKE UP MATEY!"', duration: 3000 },
    { key: 'baby_elephant', name: '🐘 Baby Elephant', description: 'Adorable baby elephant trumpeting loudly', duration: 3000 },
    { key: 'disco_chicken', name: '🐔 Disco Chicken', description: 'Funky disco chicken dance party', duration: 4000 },
    { key: 'robot_malfunction', name: '🤖 Robot Malfunction', description: 'Robot glitching out: "ERROR! HUMAN MUST WAKE!"', duration: 3000 },
    { key: 'snoring_bear', name: '🐻 Snoring Bear', description: 'Bear snoring so loud it wakes itself up', duration: 3500 },
    { key: 'chipmunk_chaos', name: '🐿️ Chipmunk Chaos', description: 'Hyperactive chipmunks chattering at high speed', duration: 3000 },
    { key: 'mom_voice', name: '👩 Mom Voice', description: 'Classic mom: "GET UP RIGHT NOW OR NO BREAKFAST!"', duration: 3500 },
    { key: 'screaming_goat', name: '🐐 Screaming Goat', description: 'Hilarious goat screaming like a human', duration: 2500 },
    { key: 'dramatic_llama', name: '🦙 Dramatic Llama', description: 'Overly dramatic llama making funny sounds', duration: 3000 },
    { key: 'singing_frog', name: '🐸 Singing Frog', description: 'Frog attempting to sing opera (badly)', duration: 3500 },
  ];

  // Display days starting with Monday (but keep Sunday=0 indexing internally)
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday display order
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Single letters starting with Monday
  const snoozeOptions = [5, 10, 15, 20, 30];

  const handleAddAlarm = () => {
    setShowAddModal(true);
  };

  const handleSaveCustomAlarm = () => {
    if (!newAlarmLabel.trim()) {
      Alert.alert('Missing Label', 'Please enter a label for your alarm');
      return;
    }

    // Convert to 24-hour format for storage
    let hour24 = newAlarmHour;
    if (!isMilitaryTime) {
      if (newAlarmAmPm === 'PM' && newAlarmHour !== 12) {
        hour24 = newAlarmHour + 12;
      } else if (newAlarmAmPm === 'AM' && newAlarmHour === 12) {
        hour24 = 0;
      }
    }

    const timeString = `${hour24.toString().padStart(2, '0')}:${newAlarmMinute.toString().padStart(2, '0')}`;
    
    const alarmData = {
      time: timeString,
      label: newAlarmLabel.trim(),
      isEnabled: true,
      repeatDays: selectedDays,
      soundName: selectedSound,
      vibrate: true,
      snoozeEnabled: snoozeEnabled,
      snoozeInterval: snoozeInterval,
    };
    
    if (editingAlarm) {
      // Update existing alarm
      updateAlarm(editingAlarm.id, alarmData);
    } else {
      // Add new alarm
      addAlarm(alarmData);
    }
    
    setShowAddModal(false);
    resetModalState();
    stopPreviewSound(); // Stop any playing preview sounds
  };

  const resetModalState = () => {
    setNewAlarmHour(isMilitaryTime ? 7 : 7);
    setNewAlarmMinute(0);
    setNewAlarmAmPm('AM');
    setNewAlarmLabel('');
    setSelectedDays([]);
    setSnoozeEnabled(true);
    setSnoozeInterval(5);
    setSelectedSound('gentle_chimes');
    setEditingAlarm(null);
  };

  const handleCancelModal = () => {
    resetModalState();
    setShowAddModal(false);
    stopPreviewSound(); // Stop any playing preview sounds
  };  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    
    if (isMilitaryTime) {
      return `${hourNum.toString().padStart(2, '0')}:${minute}`;
    } else {
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      return `${displayHour}:${minute} ${period}`;
    }
  };

  const getQuickAlarmDisplayTime = (time24: string) => {
    return formatTime(time24);
  };

  const formatRepeatDays = (repeatDays: number[]) => {
    if (repeatDays.length === 0) return 'One time';
    if (repeatDays.length === 7) return 'Every day';
    
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return repeatDays.map(day => dayNames[day]).join(', ');
  };

  const handleDeleteAlarm = (alarm: Alarm) => {
    Alert.alert(
      '🗑️ Delete Alarm',
      `Delete "${alarm.label || formatTime(alarm.time)}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteAlarm(alarm.id)
        }
      ]
    );
  };

  const handleEditAlarm = (alarm: Alarm) => {
    // Parse the time string (e.g., "07:30" -> hour: 7, minute: 30)
    const [hourStr, minuteStr] = alarm.time.split(':');
    const hour24 = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    if (isMilitaryTime) {
      setNewAlarmHour(hour24);
      setNewAlarmAmPm('AM'); // Not used in military time
    } else {
      // Convert 24-hour to 12-hour format
      if (hour24 === 0) {
        setNewAlarmHour(12);
        setNewAlarmAmPm('AM');
      } else if (hour24 <= 11) {
        setNewAlarmHour(hour24);
        setNewAlarmAmPm('AM');
      } else if (hour24 === 12) {
        setNewAlarmHour(12);
        setNewAlarmAmPm('PM');
      } else {
        setNewAlarmHour(hour24 - 12);
        setNewAlarmAmPm('PM');
      }
    }
    
    // Set the form state with the alarm's current values
    setNewAlarmMinute(minute);
    setNewAlarmLabel(alarm.label || '');
    setSelectedDays(alarm.repeatDays || []);
    setSnoozeEnabled(alarm.snoozeEnabled ?? true);
    setSnoozeInterval(alarm.snoozeInterval || 5);
    setSelectedSound(alarm.soundName || 'gentle_chimes');
    
    // Set editing mode and show modal
    setEditingAlarm(alarm);
    setShowAddModal(true);
  };

    const createQuickAlarm = async (time: string, title: string) => {
    const newAlarm = {
      id: Date.now().toString(),
      time,
      label: title,
      isEnabled: true,
      repeatDays: [], // One-time alarm
      soundName: quickAlarmSound,
      vibrate: true,
      snoozeEnabled: true,
      snoozeInterval: 5,
      createdAt: new Date().toISOString()
    };
    
    const success = await AlarmNotificationService.scheduleAlarm(newAlarm);
    
    if (success && success.length > 0) {
      addAlarm(newAlarm);
      
      // Show confirmation popup
      Alert.alert(
        '✅ Quick Alarm Set!',
        `${title} has been added to your alarms for ${getQuickAlarmDisplayTime(time)}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const getSoundDisplayName = (soundKey: string) => {
    const soundMap: { [key: string]: string } = {
      // Epic & Motivational
      'cosmic_awakening': '🌌 Cosmic Awakening',
      'champion_rise': '🏆 Champion Rise',
      'power_surge': '⚡ Power Surge',
      
      // Musical & Melodic
      'crystal_harmony': '💎 Crystal Harmony',
      'royal_fanfare': '👑 Royal Fanfare',
      'zen_bells': '🧘 Zen Bells',
      
      // Nature & Ambient
      'mystic_forest': '🧚 Mystic Forest',
      'ocean_sunrise': '🌅 Ocean Sunrise',
      'mountain_breeze': '🏔️ Mountain Breeze',
      
      // Modern & Tech
      'future_pulse': '🚀 Future Pulse',
      'digital_dawn': '🌐 Digital Dawn',
      'quantum_chime': '⚛️ Quantum Chime',
      
      // Classic Options
      'gentle_chimes': '🎐 Gentle Chimes',
      'soft_piano': '🎹 Soft Piano',
      'classic_bell': '🔔 Classic Bell',
      
      // Legacy compatibility
      'bell': '🔔 Classic Bell',
      'chime': '🎐 Gentle Chimes',
      'nature_sounds': '🧚 Mystic Forest',
      'digital': '🌐 Digital Dawn',
      'melody': '�� Soft Piano',
      'urgent': '⚡ Power Surge',
      'calm': '🧘 Zen Bells',
      'piano': '🎹 Soft Piano',
      'guitar': '💎 Crystal Harmony',
      'horn': '👑 Royal Fanfare'
    };
    return soundMap[soundKey] || '🔔 Classic Bell';
  };

  const playPreviewSound = async (soundKey: string) => {
    try {
      // Stop any currently playing sound
      if (currentPlayingSound) {
        await currentPlayingSound.unloadAsync();
        setCurrentPlayingSound(null);
      }

      // If the same sound is already playing, just stop it
      if (playingSound === soundKey) {
        setPlayingSound(null);
        return;
      }

      // Set audio mode for better mobile compatibility
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        staysActiveInBackground: false,
      });

      // Try to use local sound file first
      const localSound = getSoundFile(soundKey);
      if (localSound) {
        const { sound } = await Audio.Sound.createAsync(
          localSound,
          {
            shouldPlay: true,
            volume: 0.4,
            isLooping: false,
          }
        );
        setCurrentPlayingSound(sound);
        setPlayingSound(soundKey);
        return;
      }

      // Fallback to online URLs for preview (when local files not available)
      const soundUrls: { [key: string]: string } = {
        // Epic & Motivational
        'cosmic_awakening': 'https://www.soundjay.com/misc/sounds/magic-chime-02.wav',
        'champion_rise': 'https://www.soundjay.com/misc/sounds/fanfare-1.wav', 
        'power_surge': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        
        // Musical & Melodic
        'crystal_harmony': 'https://www.soundjay.com/misc/sounds/crystal-chimes-02.wav',
        'royal_fanfare': 'https://www.soundjay.com/misc/sounds/trumpet-fanfare-01.wav',
        'zen_bells': 'https://www.soundjay.com/misc/sounds/tibetan-bells-01.wav',
        
        // Nature & Ambient
        'mystic_forest': 'https://www.soundjay.com/nature/sounds/forest-with-creek.wav',
        'ocean_sunrise': 'https://www.soundjay.com/nature/sounds/ocean-waves-02.wav',
        'mountain_breeze': 'https://www.soundjay.com/nature/sounds/wind-chimes-01.wav',
        
        // Modern & Tech
        'future_pulse': 'https://www.soundjay.com/misc/sounds/futuristic-chime.wav',
        'digital_dawn': 'https://www.soundjay.com/misc/sounds/digital-beep-01.wav',
        'quantum_chime': 'https://www.soundjay.com/misc/sounds/crystal-chime-clean.wav',
        
        // Funny & Hilarious
        'rooster_opera': 'https://www.soundjay.com/animals/sounds/rooster-crow-01.wav',
        'alien_invasion': 'https://www.soundjay.com/misc/sounds/sci-fi-beep-01.wav',
        'grandmother_yelling': 'https://www.soundjay.com/human/sounds/woman-laughing-01.wav',
        'cat_piano': 'https://www.soundjay.com/animals/sounds/cat-meow-01.wav',
        'rubber_duck': 'https://www.soundjay.com/misc/sounds/rubber-duck-squeak.wav',
        'pirate_wake_up': 'https://www.soundjay.com/human/sounds/man-yelling-01.wav',
        'baby_elephant': 'https://www.soundjay.com/animals/sounds/elephant-trumpet-01.wav',
        'disco_chicken': 'https://www.soundjay.com/animals/sounds/chicken-cluck-01.wav',
        'robot_malfunction': 'https://www.soundjay.com/misc/sounds/robot-beep-01.wav',
        'snoring_bear': 'https://www.soundjay.com/animals/sounds/bear-growl-01.wav',
        'chipmunk_chaos': 'https://www.soundjay.com/animals/sounds/squirrel-chatter-01.wav',
        'mom_voice': 'https://www.soundjay.com/human/sounds/woman-yelling-01.wav',
        'screaming_goat': 'https://www.soundjay.com/animals/sounds/goat-bleat-01.wav',
        'dramatic_llama': 'https://www.soundjay.com/animals/sounds/llama-sound-01.wav',
        'singing_frog': 'https://www.soundjay.com/animals/sounds/frog-croak-01.wav',
        
        // Classic fallbacks
        'gentle_chimes': 'https://www2.cs.uic.edu/~i101/SoundFiles/tada.wav',
        'soft_piano': 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav',
        'classic_bell': 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
      };

      const soundUrl = soundUrls[soundKey] || soundUrls['gentle_chimes'];

      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        {
          shouldPlay: true,
          volume: 0.4,
          isLooping: false,
        }
      );

      setCurrentPlayingSound(sound);
      setPlayingSound(soundKey);

      // Auto-stop after preview duration
      const sound_duration = alarmSounds.find(s => s.key === soundKey)?.duration || 3000;
      setTimeout(async () => {
        try {
          await sound.unloadAsync();
          setCurrentPlayingSound(null);
          setPlayingSound(null);
        } catch (error) {
          console.log('Error stopping preview:', error);
        }
      }, Math.min(sound_duration, 4000)); // Max 4 seconds preview

    } catch (error) {
      console.log('Error playing preview sound:', error);
      // Enhanced fallback: show visual feedback with sound description
      setPlayingSound(soundKey);
      
      // Show a brief alert with the sound description as feedback
      const soundInfo = alarmSounds.find(s => s.key === soundKey);
      if (soundInfo) {
        Alert.alert(
          `🔊 ${soundInfo.name}`,
          `Preview: ${soundInfo.description}\n\n(Sound preview not available in Expo Go mode)`,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }
      
      setTimeout(() => {
        setPlayingSound(null);
      }, 2000);
    }
  };

  const stopPreviewSound = async () => {
    if (currentPlayingSound) {
      try {
        await currentPlayingSound.unloadAsync();
        setCurrentPlayingSound(null);
        setPlayingSound(null);
      } catch (error) {
        console.log('Error stopping sound:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Custom Alarm Button */}
        <View style={styles.addCustomSection}>
          <Button3D 
            title="+ Add Custom Alarm"
            onPress={handleAddAlarm}
            backgroundColor="#E8B4C4"
            textColor="#000000"
            size="large"
          />
        </View>
        
        {/* Quick Alarm Buttons */}
        <View style={styles.quickAlarmsSection}>
          <Text style={styles.sectionTitle}>Quick Alarms</Text>
          <View style={styles.quickAlarmsGrid}>
            <Button3D
              title={`${getQuickAlarmDisplayTime('07:00')}\nMorning`}
              onPress={() => createQuickAlarm('07:00', '🌅 Morning Routine')}
              backgroundColor="#FFFFFF"
              textColor="#000000"
              size="medium"
              style={{ flex: 1, marginRight: 8 }}
            />
            
            <Button3D
              title={`${getQuickAlarmDisplayTime('08:00')}\nWork`}
              onPress={() => createQuickAlarm('08:00', '💼 Work Time')}
              backgroundColor="#FFFFFF"
              textColor="#000000"
              size="medium"
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
          
          <View style={styles.quickAlarmsGrid}>
            <Button3D
              title={`${getQuickAlarmDisplayTime('12:00')}\nLunch`}
              onPress={() => createQuickAlarm('12:00', '🍽️ Lunch Break')}
              backgroundColor="#FFFFFF"
              textColor="#000000"
              size="medium"
              style={{ flex: 1, marginRight: 8 }}
            />
            
            <Button3D
              title={`${getQuickAlarmDisplayTime('22:00')}\nSleep`}
              onPress={() => createQuickAlarm('22:00', '🌙 Bedtime')}
              backgroundColor="#FFFFFF"
              textColor="#000000"
              size="medium"
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
          
          {/* Sound Selector */}
          <View style={styles.soundSelectorContainer}>
            <Text style={styles.soundSelectorLabel}>Quick Alarm Sound:</Text>
            <Button3D
              title={getSoundDisplayName(quickAlarmSound)}
              onPress={() => setShowSoundSelector(true)}
              backgroundColor="#FFFFFF"
              textColor="#000000"
              size="medium"
              style={{ marginTop: 10 }}
            />
          </View>
        </View>

        {/* Alarms List */}
        <View style={styles.alarmsSection}>
          <Text style={styles.sectionTitle}>💤 Your Alarms</Text>
          
          {alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>⏰</Text>
              <Text style={styles.emptyStateText}>No alarms set yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap the quick alarms above or create a custom one</Text>
            </View>
          ) : (
            alarms.map((alarm) => (
              <View key={alarm.id} style={styles.alarmCard}>
                <View style={styles.alarmMain}>
                  <View style={styles.alarmInfo}>
                    <Text style={[styles.alarmTime, { opacity: alarm.isEnabled ? 1 : 0.5 }]}>
                      {formatTime(alarm.time)}
                    </Text>
                    <Text style={[styles.alarmLabel, { opacity: alarm.isEnabled ? 1 : 0.5 }]}>
                      {alarm.label}
                    </Text>
                    <Text style={[styles.alarmRepeat, { opacity: alarm.isEnabled ? 1 : 0.5 }]}>
                      {formatRepeatDays(alarm.repeatDays)}
                    </Text>
                  </View>
                  
                  <Switch
                    value={alarm.isEnabled}
                    onValueChange={() => toggleAlarm(alarm.id)}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={alarm.isEnabled ? colors.primary : colors.textSecondary}
                  />
                </View>
                
                <View style={styles.alarmActions}>
                  <Button3D 
                    title="✏️ Edit"
                    onPress={() => handleEditAlarm(alarm)}
                    backgroundColor="#FFFFFF"
                    textColor="#000000"
                    size="small"
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  
                  <Button3D 
                    title="🗑️ Delete"
                    onPress={() => handleDeleteAlarm(alarm)}
                    backgroundColor="#FFE6E6"
                    textColor="#8B0000"
                    size="small"
                    style={{ flex: 1, marginLeft: 8 }}
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Custom Alarm Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingAlarm ? '⏰ Edit Alarm' : '⏰ Add Custom Alarm'}
            </Text>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
              {/* Time Picker */}
              <View style={styles.timePickerSection}>
                <Text style={styles.inputLabel}>Time</Text>
                <View style={styles.timePicker}>
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>Hour</Text>
                    <ScrollView 
                      style={styles.timeScrollView} 
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {(isMilitaryTime 
                        ? Array.from({ length: 24 }, (_, i) => i)
                        : Array.from({ length: 12 }, (_, i) => i + 1)
                      ).map((hour) => (
                        <TouchableOpacity
                          key={hour}
                          style={[styles.timeOption, newAlarmHour === hour && styles.selectedTimeOption]}
                          onPress={() => setNewAlarmHour(hour)}
                        >
                          <Text style={[styles.timeOptionText, newAlarmHour === hour && styles.selectedTimeOptionText]}>
                            {isMilitaryTime ? hour.toString().padStart(2, '0') : hour}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  <Text style={styles.timeColon}>:</Text>
                  
                  <View style={styles.timePickerColumn}>
                    <Text style={styles.timePickerLabel}>Minute</Text>
                    <ScrollView 
                      style={styles.timeScrollView} 
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                        <TouchableOpacity
                          key={minute}
                          style={[styles.timeOption, newAlarmMinute === minute && styles.selectedTimeOption]}
                          onPress={() => setNewAlarmMinute(minute)}
                        >
                          <Text style={[styles.timeOptionText, newAlarmMinute === minute && styles.selectedTimeOptionText]}>
                            {minute.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {!isMilitaryTime && (
                    <>
                      <Text style={styles.timeColon}>:</Text>
                      <View style={styles.timePickerColumn}>
                        <Text style={styles.timePickerLabel}>AM/PM</Text>
                        <ScrollView 
                          style={styles.timeScrollView} 
                          showsVerticalScrollIndicator={false}
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {['AM', 'PM'].map(period => (
                            <TouchableOpacity
                              key={period}
                              style={[styles.timeOption, newAlarmAmPm === period && styles.selectedTimeOption]}
                              onPress={() => setNewAlarmAmPm(period as 'AM' | 'PM')}
                            >
                              <Text style={[styles.timeOptionText, newAlarmAmPm === period && styles.selectedTimeOptionText]}>
                                {period}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Label Input */}
              <View style={styles.labelInputSection}>
                <Text style={styles.inputLabel}>Label</Text>
                <TextInput
                  style={styles.labelInput}
                  value={newAlarmLabel}
                  onChangeText={setNewAlarmLabel}
                  placeholder="Enter alarm name..."
                  placeholderTextColor={colors.textSecondary}
                  maxLength={50}
                />
              </View>

              {/* Days Selection */}
              <View style={styles.daysSection}>
                <Text style={styles.inputLabel}>Repeat Days</Text>
                <View style={styles.daysGrid}>
                  {dayOrder.map((dayIndex, displayIndex) => (
                    <TouchableOpacity
                      key={dayIndex}
                      onPress={() => toggleDay(dayIndex)}
                      style={{ 
                        flex: 1,
                        marginHorizontal: 3,
                        height: 35,
                        width: 35,
                        backgroundColor: selectedDays.includes(dayIndex) ? "#E8B4C4" : "#FFFFFF",
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: selectedDays.includes(dayIndex) ? "#D8A4B4" : "#E0E0E0"
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#000000',
                        textAlign: 'center'
                      }}
                      numberOfLines={1}
                      >
                        {dayLabels[displayIndex]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.daysHint}>
                  {selectedDays.length === 0 ? 'One-time alarm' : 
                   selectedDays.length === 7 ? 'Every day' : 
                   `${selectedDays.length} days selected`}
                </Text>
              </View>

              {/* Snooze Options */}
              <View style={styles.snoozeSection}>
                <View style={styles.snoozeSectionHeader}>
                  <Text style={styles.inputLabel}>Snooze</Text>
                  <Switch
                    value={snoozeEnabled}
                    onValueChange={setSnoozeEnabled}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={snoozeEnabled ? colors.primary : colors.textSecondary}
                  />
                </View>
                
                {snoozeEnabled && (
                  <View style={styles.snoozeOptions}>
                    <Text style={styles.snoozeLabel}>Snooze interval (minutes)</Text>
                    <View style={styles.snoozeGrid}>
                      {snoozeOptions.map(interval => (
                        <TouchableOpacity
                          key={interval}
                          onPress={() => setSnoozeInterval(interval)}
                          style={{ 
                            marginHorizontal: 3,
                            height: 35,
                            minWidth: 45,
                            paddingHorizontal: 8,
                            backgroundColor: snoozeInterval === interval ? "#E8B4C4" : "#FFFFFF",
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: snoozeInterval === interval ? "#D8A4B4" : "#E0E0E0"
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#000000',
                            textAlign: 'center'
                          }}>
                            {interval.toString()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Alarm Sound Selection */}
              <View style={styles.soundSection}>
                <Text style={styles.inputLabel}>Alarm Sound</Text>
                <ScrollView 
                  style={styles.soundScrollView} 
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {alarmSounds.map(sound => (
                    <View key={sound.key} style={styles.soundOptionContainer}>
                      <TouchableOpacity
                        style={[styles.soundOption, selectedSound === sound.key && styles.selectedSoundOption]}
                        onPress={() => setSelectedSound(sound.key)}
                      >
                        <View style={styles.soundInfo}>
                          <Text style={[styles.soundName, selectedSound === sound.key && styles.selectedSoundName]}>
                            {sound.name}
                          </Text>
                          <Text style={[styles.soundDescription, selectedSound === sound.key && styles.selectedSoundDescription]}>
                            {sound.description}
                          </Text>
                        </View>
                        <View style={styles.soundActions}>
                          <TouchableOpacity
                            style={[styles.previewButton, playingSound === sound.key && styles.previewButtonPlaying]}
                            onPress={() => playPreviewSound(sound.key)}
                          >
                            <Text style={[styles.previewButtonText, playingSound === sound.key && styles.previewButtonTextPlaying]}>
                              {playingSound === sound.key ? '⏹️' : '▶️'}
                            </Text>
                          </TouchableOpacity>
                          {selectedSound === sound.key && (
                            <Text style={styles.soundCheckmark}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Modal Buttons */}
              <View style={[styles.modalButtons, { paddingBottom: Math.max(20, insets.bottom + 16) }]}>
                <Button3D 
                  title="Cancel"
                  onPress={handleCancelModal}
                  backgroundColor="#FFFFFF"
                  textColor="#000000"
                  style={{ flex: 1, marginRight: 6 }}
                />
                
                <Button3D 
                  title={editingAlarm ? 'Update Alarm' : 'Save Alarm'}
                  onPress={handleSaveCustomAlarm}
                  backgroundColor="#E8B4C4"
                  textColor="#000000"
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Sound Selector Modal */}
        <Modal
          visible={showSoundSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSoundSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '50%' }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader} {...panResponder.panHandlers}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Choose Quick Alarm Sound</Text>
              </View>

              {/* Sound Options */}
              <ScrollView style={styles.soundsList}>
                {[
                  // Epic & Motivational
                  { key: 'cosmic_awakening', name: '🌌 Cosmic Awakening', description: 'Ethereal space sounds building to inspiration' },
                  { key: 'champion_rise', name: '🏆 Champion Rise', description: 'Heroic orchestral theme for ambitious mornings' },
                  { key: 'power_surge', name: '⚡ Power Surge', description: 'Energizing electronic beats with uplifting melody' },
                  
                  // Musical & Melodic
                  { key: 'crystal_harmony', name: '💎 Crystal Harmony', description: 'Beautiful crystal bowl harmonics' },
                  { key: 'royal_fanfare', name: '👑 Royal Fanfare', description: 'Majestic brass fanfare fit for royalty' },
                  { key: 'zen_bells', name: '🧘 Zen Bells', description: 'Peaceful temple bells with reverb' },
                  
                  // Nature & Ambient
                  { key: 'mystic_forest', name: '🧚 Mystic Forest', description: 'Enchanted forest with magical undertones' },
                  { key: 'ocean_sunrise', name: '🌅 Ocean Sunrise', description: 'Gentle waves with morning birds' },
                  
                  // Modern & Tech
                  { key: 'future_pulse', name: '🚀 Future Pulse', description: 'Futuristic sci-fi awakening sequence' },
                  { key: 'digital_dawn', name: '💻 Digital Dawn', description: 'Clean modern tones with building energy' },
                  
                  // Classic favorites
                  { key: 'gentle_chimes', name: '🎐 Gentle Chimes', description: 'Soft and peaceful traditional' },
                  { key: 'classic_bell', name: '🔔 Classic Bell', description: 'Traditional alarm bell' },
                  
                  // Funny & Hilarious
                  { key: 'rooster_opera', name: '🐓 Rooster Opera', description: 'Dramatic rooster awakening performance' },
                  { key: 'alien_invasion', name: '👽 Alien Invasion', description: 'Sci-fi wake up call from space' },
                  { key: 'grandmother_yelling', name: '👵 Grandmother Yelling', description: 'Classic wake up technique' },
                  { key: 'cat_piano', name: '🐱 Cat Piano', description: 'Musical feline surprise' },
                  { key: 'rubber_duck', name: '🦆 Rubber Duck', description: 'Squeaky morning greeting' },
                  { key: 'pirate_wake_up', name: '🏴‍☠️ Pirate Wake Up', description: 'Arrr, time to rise matey!' },
                  { key: 'baby_elephant', name: '🐘 Baby Elephant', description: 'Adorable trumpet call' },
                  { key: 'disco_chicken', name: '🐔 Disco Chicken', description: 'Funky clucking beats' },
                  { key: 'robot_malfunction', name: '🤖 Robot Malfunction', description: 'Glitchy morning beeps' },
                  { key: 'snoring_bear', name: '🐻 Snoring Bear', description: 'From sleep to growl' },
                  { key: 'chipmunk_chaos', name: '🐿️ Chipmunk Chaos', description: 'Hyperactive chatter' },
                  { key: 'mom_voice', name: '👩 Mom Voice', description: 'The ultimate wake up call' },
                  { key: 'screaming_goat', name: '🐐 Screaming Goat', description: 'Internet famous wake up' },
                  { key: 'dramatic_llama', name: '🦙 Dramatic Llama', description: 'Theatrical morning call' },
                  { key: 'singing_frog', name: '🐸 Singing Frog', description: 'Croaky morning serenade' },
                ].map((sound) => (
                  <View key={sound.key} style={styles.soundOptionContainer}>
                    <TouchableOpacity
                      style={[styles.soundOption, quickAlarmSound === sound.key && styles.selectedSoundOption]}
                      onPress={() => {
                        setQuickAlarmSound(sound.key);
                        setShowSoundSelector(false);
                      }}
                    >
                      <View style={styles.soundInfo}>
                        <Text style={[styles.soundName, quickAlarmSound === sound.key && styles.selectedSoundName]}>
                          {sound.name}
                        </Text>
                        <Text style={[styles.soundDescription, quickAlarmSound === sound.key && styles.selectedSoundDescription]}>
                          {sound.description}
                        </Text>
                      </View>
                      <View style={styles.soundActions}>
                        <TouchableOpacity
                          style={[styles.previewButton, playingSound === sound.key && styles.previewButtonPlaying]}
                          onPress={() => playPreviewSound(sound.key)}
                        >
                          <Text style={[styles.previewButtonText, playingSound === sound.key && styles.previewButtonTextPlaying]}>
                            {playingSound === sound.key ? '⏹️' : '▶️'}
                          </Text>
                        </TouchableOpacity>
                        {quickAlarmSound === sound.key && (
                          <Text style={styles.soundCheckmark}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    padding: 20,
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
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'System',
  },
  quickAlarmsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  addCustomSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  addCustomButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addCustomButtonText: {
    color: colors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickAlarmsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAlarmButton: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F7D1DA',
  },
  quickAlarmTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  quickAlarmLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  alarmsSection: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  alarmCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alarmMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  alarmLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 3,
  },
  alarmRepeat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alarmActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    backgroundColor: '#FFE6E6',
    borderColor: '#FFB3B3',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B0000', // Dark red text for delete button
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background, // Use theme background like normal screens
    // 3D enhancement
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: '#F0C7D1',
    borderLeftColor: '#F0C7D1',
    borderRightColor: '#D1A1B1',
    transform: [{ rotateX: '-2deg' }],
  },
  modalHeader: {
    backgroundColor: '#E8B4C4', // Keep pink header
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D1A1B1',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // 3D header effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0C7D1',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1A1B1', // Use theme color
    borderRadius: 2,
    opacity: 0.8,
    marginBottom: 15,
    // 3D handle effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0C7D1',
    borderBottomWidth: 1,
    borderBottomColor: '#B8A1B1',
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background, // Use theme background like normal screens
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // Black text for consistency
    textAlign: 'center',
    marginBottom: 25,
    // 3D text effects
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  // Time Picker Styles
  timePickerSection: {
    marginBottom: 25,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timePickerColumn: {
    alignItems: 'center',
    width: 80,
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  timeScrollView: {
    maxHeight: 120,
    width: '100%',
    flex: 1,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    borderTopColor: '#F0F0F0',
    borderLeftColor: '#F0F0F0',
    borderRightColor: '#D0D0D0',
    borderBottomColor: '#D0D0D0',
  },
  selectedTimeOption: {
    backgroundColor: '#E8B4C4',
    borderTopColor: '#F0C7D1',
    borderLeftColor: '#F0C7D1',
    borderRightColor: '#D1A1B1',
    borderBottomColor: '#D1A1B1',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.2,
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  selectedTimeOptionText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  timeColon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
  },
  // Label Input Styles
  labelInputSection: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  labelInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Days Selection Styles
  daysSection: {
    marginBottom: 25,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 25,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDayButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  selectedDayButtonText: {
    color: colors.buttonText,
  },
  daysHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Snooze Styles
  snoozeSection: {
    marginBottom: 25,
  },
  snoozeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  snoozeOptions: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  snoozeLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  snoozeGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  snoozeButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedSnoozeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  snoozeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedSnoozeButtonText: {
    color: colors.buttonText,
  },
  // Sound Selection Styles
  soundSection: {
    marginBottom: 25,
  },
  soundScrollView: {
    maxHeight: 200,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  soundOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#F0F0F0',
    borderRightColor: '#D0D0D0',
  },
  selectedSoundOption: {
    backgroundColor: '#E8B4C4',
    borderLeftColor: '#F0C7D1',
    borderRightColor: '#D1A1B1',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.1,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  selectedSoundName: {
    color: '#000000',
  },
  soundDescription: {
    fontSize: 12,
    color: '#666666',
  },
  selectedSoundDescription: {
    color: '#000000',
    opacity: 1,
  },
  soundCheckmark: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  // Preview Button Styles
  soundOptionContainer: {
    marginBottom: 1,
  },
  soundActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderTopColor: '#F0F0F0',
    borderLeftColor: '#F0F0F0',
    borderRightColor: '#D0D0D0',
    borderBottomColor: '#D0D0D0',
  },
  previewButtonPlaying: {
    backgroundColor: '#E8B4C4',
    borderTopColor: '#F0C7D1',
    borderLeftColor: '#F0C7D1',
    borderRightColor: '#D1A1B1',
    borderBottomColor: '#D1A1B1',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.2,
  },
  previewButtonText: {
    fontSize: 12,
    color: '#000000',
  },
  previewButtonTextPlaying: {
    color: '#000000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  soundSelectorContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soundSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  soundSelectorButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  soundSelectorText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  soundsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
});