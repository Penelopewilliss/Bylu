import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { BrainDumpEntry } from '../types';
import fonts from '../constants/fonts';

export default function BrainDumpScreen() {
  const { colors } = useTheme();
  const { brainDump, addBrainDumpEntry, deleteBrainDumpEntry } = useApp();
  const [currentThought, setCurrentThought] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const styles = createStyles(colors);

  const handleQuickCapture = () => {
    if (currentThought.trim()) {
      addBrainDumpEntry(currentThought.trim());
      setCurrentThought('');
      
      // Show a gentle feedback
      Alert.alert('💭', 'Thought captured!', [{ text: 'Continue', style: 'default' }]);
    }
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          <Text style={styles.cloudEmoji}>💭</Text>
          <Text style={styles.subtitleText}> Capture your racing thoughts</Text>
        </Text>
      </View>

      {/* Quick Capture */}
      <View style={styles.captureSection}>
        <TextInput
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
      </View>

      {/* Thoughts List */}
      <ScrollView style={styles.thoughtsList} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.thoughtText}>{entry.content}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
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
    color: '#FFFFFF',
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
  thoughtsList: {
    flex: 1,
    paddingHorizontal: 20,
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
  bottomSpacing: {
    height: 100,
  },
});