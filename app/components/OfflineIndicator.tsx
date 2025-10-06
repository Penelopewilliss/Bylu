import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOffline } from '../context/OfflineContext';

interface OfflineIndicatorProps {
  style?: any;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ style }) => {
  const { isOnline, isSyncing, pendingActions, forceSync } = useOffline();

  if (isOnline && pendingActions === 0) {
    return null; // Don't show anything when online with no pending actions
  }

  const getStatusText = () => {
    if (!isOnline) {
      return pendingActions > 0 
        ? `📱 Offline • ${pendingActions} pending`
        : '📱 Offline mode';
    }
    
    if (isSyncing) {
      return '🔄 Syncing...';
    }
    
    if (pendingActions > 0) {
      return `📤 ${pendingActions} items to sync`;
    }
    
    return '✅ All synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return '#FF6B6B'; // Red for offline
    if (isSyncing) return '#4ECDC4'; // Teal for syncing
    if (pendingActions > 0) return '#FFE66D'; // Yellow for pending
    return '#95E1D3'; // Green for synced
  };

  const handlePress = () => {
    if (isOnline && pendingActions > 0 && !isSyncing) {
      forceSync();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: getStatusColor() }, style]}
      onPress={handlePress}
      disabled={!isOnline || isSyncing || pendingActions === 0}
      activeOpacity={0.8}
    >
      <Text style={styles.statusText}>{getStatusText()}</Text>
      {isOnline && pendingActions > 0 && !isSyncing && (
        <Text style={styles.tapText}>Tap to sync</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  tapText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default OfflineIndicator;