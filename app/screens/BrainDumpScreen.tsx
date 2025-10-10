import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BrainDumpEntry } from '../types';
import fonts from '../constants/fonts';

export default function BrainDumpScreen({ deepLink, onDeepLinkHandled }: { deepLink?: any; onDeepLinkHandled?: () => void }) {
  const { colors } = useTheme();
  const { brainDump, addBrainDumpEntry, deleteBrainDumpEntry } = useApp();
  const insets = useSafeAreaInsets();
  const [currentThought, setCurrentThought] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Voice recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const styles = createStyles(colors);
  const textInputRef = useRef<TextInput>(null);

  // Handle deep link to open add modals
  useEffect(() => {
    if (deepLink?.type === 'add-thought') {
      textInputRef.current?.focus();
      onDeepLinkHandled?.();
    } else if (deepLink?.type === 'add-voice-memo') {
      startRecording();
      onDeepLinkHandled?.();
    }
  }, [deepLink]);

  // Clean up broken voice memos on component mount
  useEffect(() => {
    cleanupBrokenVoiceMemos();
  }, []);

  const handleQuickCapture = () => {
    if (currentThought.trim()) {
      addBrainDumpEntry(currentThought.trim());
      setCurrentThought('');
      
      // Show a gentle feedback
      Alert.alert('💭', 'Thought captured!', [{ text: 'Continue', style: 'default' }]);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      console.log('🎤 Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('🎤 Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('🎤 Recording Error', 'Could not start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    console.log('🎤 Stopping recording..');
    if (!recording) return;

    setIsRecording(false);
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    console.log('🎤 Recording stopped and stored at', uri);
    
    if (uri) {
      try {
        // Create permanent storage directory for audio files
        const audioDir = `${FileSystem.documentDirectory}audio/`;
        const dirInfo = await FileSystem.getInfoAsync(audioDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
        }
        
        // Generate unique filename
        const filename = `voice_memo_${Date.now()}.m4a`;
        const permanentUri = `${audioDir}${filename}`;
        
        // Copy from temporary location to permanent storage
        await FileSystem.copyAsync({
          from: uri,
          to: permanentUri,
        });
        
        console.log('🎤 Audio file saved permanently at:', permanentUri);
        
        // Get recording duration
        const { sound } = await Audio.Sound.createAsync({ uri: permanentUri });
        const status = await sound.getStatusAsync();
        const duration = status.isLoaded ? status.durationMillis || 0 : 0;
        await sound.unloadAsync();

        // Add voice memo to brain dump with permanent URI
        const voiceMemo = {
          type: 'voice' as const,
          audioUri: permanentUri,
          duration: Math.round(duration / 1000), // Convert to seconds
        };
        
        addBrainDumpEntry('🎤 Voice memo', voiceMemo);
        Alert.alert('🎤', 'Voice memo captured!', [{ text: 'Continue', style: 'default' }]);
      } catch (error) {
        console.error('Failed to save audio file permanently:', error);
        Alert.alert('🎤 Storage Error', 'Could not save voice memo permanently.');
      }
    }
  };

  const playVoiceMemo = async (entry: BrainDumpEntry) => {
    try {
      if (playingSound) {
        await playingSound.unloadAsync();
        setPlayingSound(null);
        setPlayingId(null);
      }

      if (entry.audioUri) {
        console.log('🔊 Playing voice memo:', entry.audioUri);
        
        // Check if file exists before trying to play
        const fileInfo = await FileSystem.getInfoAsync(entry.audioUri);
        if (!fileInfo.exists) {
          console.error('🔊 Voice memo file not found:', entry.audioUri);
          Alert.alert('🔊 Playback Error', 'Voice memo file not found. This may be an old recording that was cleared from cache.');
          return;
        }
        
        const { sound } = await Audio.Sound.createAsync({ uri: entry.audioUri });
        setPlayingSound(sound);
        setPlayingId(entry.id);
        
        await sound.playAsync();
        
        // Reset playing state when finished
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingSound(null);
            setPlayingId(null);
          }
        });
      }
    } catch (error) {
      console.error('Error playing voice memo:', error);
      Alert.alert('🔊 Playback Error', 'Could not play voice memo.');
    }
  };

  // Clean up broken voice memo entries on component mount
  const cleanupBrokenVoiceMemos = async () => {
    try {
      const brokenEntries = [];
      for (const entry of brainDump) {
        if (entry.type === 'voice' && entry.audioUri) {
          const fileInfo = await FileSystem.getInfoAsync(entry.audioUri);
          if (!fileInfo.exists) {
            console.log('🗑️ Found broken voice memo entry:', entry.id);
            brokenEntries.push(entry.id);
          }
        }
      }
      
      // Remove broken entries
      for (const entryId of brokenEntries) {
        deleteBrainDumpEntry(entryId);
      }
      
      if (brokenEntries.length > 0) {
        console.log(`🗑️ Cleaned up ${brokenEntries.length} broken voice memo entries`);
      }
    } catch (error) {
      console.error('Error cleaning up voice memos:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredThoughts = brainDump.filter(entry =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteThought = (id: string, content: string) => {
    // Try direct delete first for testing
    try {
      console.log('Attempting to delete entry:', id);
      deleteBrainDumpEntry(id);
    } catch (error) {
      console.error('Error deleting entry:', error);
      // Fallback to Alert
      Alert.alert(
        '🗑️ Delete Thought',
        `Remove "${content.slice(0, 30)}${content.length > 30 ? '...' : ''}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
            console.log('Deleting brain dump entry with id:', id);
            deleteBrainDumpEntry(id);
          }}
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with full height background */}
          <Text style={styles.headerText}>
            <Text style={styles.cloudEmoji}>💭</Text>
            <Text style={styles.subtitleText}> Capture your racing thoughts</Text>
          </Text>

          {/* Quick Capture */}
          <View style={styles.captureSection}>
            <TextInput
              ref={textInputRef}
              style={styles.thoughtInput}
              value={currentThought}
              onChangeText={setCurrentThought}
              placeholder="What's on your mind? Just dump it here..."
              placeholderTextColor={colors.placeholderText}
              multiline
              maxLength={500}
              onSubmitEditing={handleQuickCapture}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.captureButton, currentThought.trim() ? styles.captureButtonActive : null]}
              onPress={handleQuickCapture}
              disabled={!currentThought.trim()}
            >
              <Text style={[styles.captureButtonText, currentThought.trim() ? styles.captureButtonTextActive : null]}>✨ Capture</Text>
            </TouchableOpacity>
            
            {/* Voice Recording Controls */}
            <View style={styles.voiceSection}>
              <Text style={styles.voiceSectionTitle}>🎤 Voice Memo</Text>
              <TouchableOpacity
                style={[styles.voiceButton, isRecording ? styles.voiceButtonRecording : null]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Text style={styles.voiceButtonText}>
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                </Text>
              </TouchableOpacity>
              {isRecording && (
                <Text style={styles.recordingIndicator}>🔴 Recording...</Text>
              )}
            </View>
          </View>

          {/* Thoughts List */}
          <View style={styles.thoughtsListContainer}>
            {filteredThoughts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🧠</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No thoughts match your search' : 'Your mind palace awaits...'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery ? 'Try a different search term' : 'Start dumping those racing thoughts!'}
                </Text>
              </View>
            ) : (
              filteredThoughts.map((entry) => (
            <View key={entry.id} style={styles.thoughtCard}>
              {entry.type === 'voice' ? (
                // Voice memo display
                <View style={styles.voiceMemoContainer}>
                  <View style={styles.voiceMemoHeader}>
                    <Text style={styles.voiceMemoTitle}>🎤 Voice Memo</Text>
                    {entry.duration && (
                      <Text style={styles.voiceDuration}>{formatDuration(entry.duration)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.playButton, playingId === entry.id ? styles.playButtonActive : null]}
                    onPress={() => playVoiceMemo(entry)}
                  >
                    <Text style={styles.playButtonText}>
                      {playingId === entry.id ? '⏸️ Playing...' : '▶️ Play'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Regular text thought display
                <Text style={styles.thoughtText}>{entry.content}</Text>
              )}
              <View style={styles.thoughtFooter}>
                <Text style={styles.thoughtDate}>{formatDate(entry.createdAt)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteThought(entry.id, entry.content)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
              ))
            )}
            
            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerText: {
    backgroundColor: colors.background,
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 30,
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cloudEmoji: {
    fontSize: 42,
    marginRight: 8,
  },
  subtitleText: {
    fontSize: 26,
    color: colors.textSecondary,
    fontFamily: 'GreatVibes_400Regular',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  captureSection: {
    padding: 20,
    paddingTop: 10,
  },
  thoughtInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 15,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  captureButton: {
    backgroundColor: colors.border,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'center',
  },
  captureButtonActive: {
    backgroundColor: colors.accent,
  },
  captureButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureButtonTextActive: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thoughtsListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  thoughtCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thoughtText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  thoughtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thoughtDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: colors.border + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  voiceSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  voiceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  voiceButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  voiceButtonRecording: {
    backgroundColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  recordingIndicator: {
    fontSize: 14,
    color: '#FF6B9D',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  voiceMemoContainer: {
    backgroundColor: colors.primary + '10',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  voiceMemoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  voiceMemoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  voiceDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  playButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacing: {
    height: 100,
  },
});