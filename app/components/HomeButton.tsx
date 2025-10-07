import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface HomeButtonProps {
  onPress: () => void;
  inHeader?: boolean; // New prop to indicate if it's in a header
  headerOverlay?: boolean; // New prop for overlay on existing header
}

export default function HomeButton({ onPress, inHeader = false, headerOverlay = false }: HomeButtonProps) {
  const { colors } = useTheme();

  if (headerOverlay) {
    // Header overlay version - positions over existing navigation header
    return (
      <TouchableOpacity 
        style={styles.headerOverlayContainer} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerOverlayIconContainer}>
          {/* Simple house icon using geometric shapes */}
          <View style={styles.headerOverlayHouseBase} />
          <View style={styles.headerOverlayHouseRoof} />
          <View style={styles.headerOverlayHouseDoor} />
        </View>
      </TouchableOpacity>
    );
  }

  if (inHeader) {
    // Header version - smaller and integrated
    return (
      <TouchableOpacity 
        style={styles.headerContainer} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerIconContainer}>
          {/* Simple house icon using geometric shapes */}
          <View style={styles.headerHouseBase} />
          <View style={styles.headerHouseRoof} />
          <View style={styles.headerHouseDoor} />
        </View>
      </TouchableOpacity>
    );
  }

  // Original floating version
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {/* Simple house icon using geometric shapes */}
        <View style={styles.houseBase} />
        <View style={styles.houseRoof} />
        <View style={styles.houseDoor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Original floating version styles
  container: {
    position: 'absolute',
    top: 50, // Below status bar
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseBase: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  houseRoof: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  houseDoor: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 0.5,
  },
  // Header version styles
  headerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerHouseBase: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  headerHouseRoof: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  headerHouseDoor: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: 4,
    backgroundColor: '#F7D1DA',
    borderRadius: 0.5,
  },
  // Header overlay version styles - positioned within existing navigation header
  headerOverlayContainer: {
    position: 'absolute',
    top: 56, // Better alignment with React Navigation header center
    left: 16,
    width: 32, // Smaller, more appropriate size
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000', // Full black for visibility
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    // White border for contrast
    borderWidth: 1,
    borderColor: '#FFFFFF',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  headerOverlayIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlayHouseBase: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  headerOverlayHouseRoof: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  headerOverlayHouseDoor: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 0.5,
  },
});