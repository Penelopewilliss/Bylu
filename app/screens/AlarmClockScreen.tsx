import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput, PanResponder, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { AlarmNotificationService } from '../services/AlarmNotificationService';
import type { Alarm } from '../types';

interface AlarmClockScreenProps {
  onNavigate?: (screen: string) => void;
  deepLink?: any;
  onDeepLinkHandled?: () => void;
}

export default function AlarmClockScreen({ onNavigate, deepLink, onDeepLinkHandled }: AlarmClockScreenProps) {
  const { colors } = useTheme();
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useApp();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [newAlarmHour, setNewAlarmHour] = useState(7);
  const [newAlarmMinute, setNewAlarmMinute] = useState(0);
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
    { key: 'gentle_chimes', name: '🎐 Gentle Chimes', description: 'Soft and peaceful', duration: 3000 },
    { key: 'soft_piano', name: '🎹 Soft Piano', description: 'Melodic and calming', duration: 3000 },
    { key: 'nature_sounds', name: '🌿 Nature Sounds', description: 'Birds and water', duration: 3000 },
    { key: 'classic_bell', name: '🔔 Classic Bell', description: 'Traditional alarm', duration: 2000 },
    { key: 'peaceful_melody', name: '🎵 Peaceful Melody', description: 'Soothing tune', duration: 4000 },
    { key: 'morning_breeze', name: '🍃 Morning Breeze', description: 'Light and airy', duration: 3000 },
    { key: 'ocean_waves', name: '🌊 Ocean Waves', description: 'Rhythmic and calm', duration: 3000 },
    { key: 'forest_birds', name: '🐦 Forest Birds', description: 'Natural wake-up call', duration: 3000 },
    { key: 'wind_chimes', name: '💨 Wind Chimes', description: 'Ethereal and light', duration: 2500 },
    { key: 'rainfall', name: '🌧️ Gentle Rain', description: 'Soft and steady', duration: 3000 },
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const snoozeOptions = [5, 10, 15, 20, 30];

  const handleAddAlarm = () => {
    setShowAddModal(true);
  };

  const handleSaveCustomAlarm = () => {
    if (!newAlarmLabel.trim()) {
      Alert.alert('Missing Label', 'Please enter a label for your alarm');
      return;
    }

    const timeString = `${newAlarmHour.toString().padStart(2, '0')}:${newAlarmMinute.toString().padStart(2, '0')}`;
    
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
    setNewAlarmHour(7);
    setNewAlarmMinute(0);
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
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

  const formatRepeatDays = (repeatDays: number[]) => {
    if (repeatDays.length === 0) return 'One time';
    if (repeatDays.length === 7) return 'Every day';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    // Set the form state with the alarm's current values
    setNewAlarmHour(hour);
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
    }
  };

  const getSoundDisplayName = (soundKey: string) => {
    const soundMap: { [key: string]: string } = {
      'bell': '🔔 Classic Bell',
      'chime': '🎵 Gentle Chime',
      'nature_sounds': '🌿 Nature Sounds',
      'digital': '📱 Digital Beep',
      'melody': '🎶 Melody',
      'urgent': '🚨 Urgent Alert',
      'calm': '🧘 Calm Tone',
      'piano': '🎹 Piano Notes',
      'guitar': '🎸 Guitar Strum',
      'horn': '📯 Horn Sound'
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

      // Different sound URLs for each alarm type - using more reliable sources
      const soundUrls: { [key: string]: string } = {
        'gentle_chimes': 'https://www2.cs.uic.edu/~i101/SoundFiles/Taunt.wav',
        'soft_piano': 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav',
        'nature_sounds': 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
        'classic_bell': 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav',
        'peaceful_melody': 'https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav',
        'morning_breeze': 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav',
        'ocean_waves': 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav',
        'forest_birds': 'https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav',
        'wind_chimes': 'https://www2.cs.uic.edu/~i101/SoundFiles/tada.wav',
        'rainfall': 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble.wav',
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
          <TouchableOpacity style={styles.addCustomButton} onPress={handleAddAlarm}>
            <Text style={styles.addCustomButtonText}>+ Add Custom Alarm</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Alarm Buttons */}
        <View style={styles.quickAlarmsSection}>
          <Text style={styles.sectionTitle}>Quick Alarms</Text>
          <View style={styles.quickAlarmsGrid}>
            <TouchableOpacity 
              style={styles.quickAlarmButton}
              onPress={() => createQuickAlarm('07:00', '🌅 Morning Routine')}
            >
              <Text style={styles.quickAlarmTime}>7:00 AM</Text>
              <Text style={styles.quickAlarmLabel}>Morning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAlarmButton}
              onPress={() => createQuickAlarm('08:00', '💼 Work Time')}
            >
              <Text style={styles.quickAlarmTime}>8:00 AM</Text>
              <Text style={styles.quickAlarmLabel}>Work</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAlarmButton}
              onPress={() => createQuickAlarm('12:00', '🍽️ Lunch Break')}
            >
              <Text style={styles.quickAlarmTime}>12:00 PM</Text>
              <Text style={styles.quickAlarmLabel}>Lunch</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAlarmButton}
              onPress={() => createQuickAlarm('22:00', '🌙 Bedtime')}
            >
              <Text style={styles.quickAlarmTime}>10:00 PM</Text>
              <Text style={styles.quickAlarmLabel}>Sleep</Text>
            </TouchableOpacity>
          </View>
          
          {/* Sound Selector */}
          <View style={styles.soundSelectorContainer}>
            <Text style={styles.soundSelectorLabel}>Quick Alarm Sound:</Text>
            <TouchableOpacity 
              style={styles.soundSelectorButton}
              onPress={() => setShowSoundSelector(true)}
            >
              <Text style={styles.soundSelectorText}>
                {getSoundDisplayName(quickAlarmSound)}
              </Text>
            </TouchableOpacity>
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
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditAlarm(alarm)}
                  >
                    <Text style={styles.actionButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAlarm(alarm)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
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
                      {Array.from({ length: 24 }, (_, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[styles.timeOption, newAlarmHour === i && styles.selectedTimeOption]}
                          onPress={() => setNewAlarmHour(i)}
                        >
                          <Text style={[styles.timeOptionText, newAlarmHour === i && styles.selectedTimeOptionText]}>
                            {i.toString().padStart(2, '0')}
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
                  {dayNames.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dayButton, selectedDays.includes(index) && styles.selectedDayButton]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[styles.dayButtonText, selectedDays.includes(index) && styles.selectedDayButtonText]}>
                        {day}
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
                          style={[styles.snoozeButton, snoozeInterval === interval && styles.selectedSnoozeButton]}
                          onPress={() => setSnoozeInterval(interval)}
                        >
                          <Text style={[styles.snoozeButtonText, snoozeInterval === interval && styles.selectedSnoozeButtonText]}>
                            {interval}
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
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveCustomAlarm}>
                  <Text style={styles.saveButtonText}>
                    {editingAlarm ? 'Update Alarm' : 'Save Alarm'}
                  </Text>
                </TouchableOpacity>
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
                  { key: 'bell', name: '🔔 Classic Bell', description: 'Traditional alarm sound' },
                  { key: 'chime', name: '🎵 Gentle Chime', description: 'Soft and pleasant' },
                  { key: 'nature_sounds', name: '🌿 Nature Sounds', description: 'Birds and forest' },
                  { key: 'digital', name: '📱 Digital Beep', description: 'Modern electronic sound' },
                  { key: 'melody', name: '🎶 Melody', description: 'Peaceful tune' },
                  { key: 'urgent', name: '🚨 Urgent Alert', description: 'Strong wake-up call' },
                  { key: 'calm', name: '🧘 Calm Tone', description: 'Gentle awakening' },
                  { key: 'piano', name: '🎹 Piano Notes', description: 'Soft piano melody' },
                  { key: 'guitar', name: '🎸 Guitar Strum', description: 'Acoustic guitar' },
                  { key: 'horn', name: '📯 Horn Sound', description: 'Clear horn sound' },
                ].map((sound) => (
                  <TouchableOpacity
                    key={sound.key}
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
                    {quickAlarmSound === sound.key && (
                      <Text style={styles.soundCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
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
    backgroundColor: colors.background,
  },
  modalHeader: {
    backgroundColor: colors.cardBackground,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
    opacity: 0.5,
    marginBottom: 15,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 25,
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
  },
  selectedTimeOption: {
    backgroundColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  selectedTimeOptionText: {
    color: colors.buttonText,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  },
  selectedSoundOption: {
    backgroundColor: colors.primary + '20',
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedSoundName: {
    color: colors.primary,
  },
  soundDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedSoundDescription: {
    color: colors.primary,
    opacity: 0.8,
  },
  soundCheckmark: {
    fontSize: 18,
    color: colors.primary,
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
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  previewButtonPlaying: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  previewButtonText: {
    fontSize: 12,
    color: colors.primary,
  },
  previewButtonTextPlaying: {
    color: colors.buttonText,
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