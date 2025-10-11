import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Card3DProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
}

export default function Card3D({ 
  children, 
  backgroundColor = '#FFFFFF',
  style,
  padding = 16,
  borderRadius = 16
}: Card3DProps) {
  
  const darkerColor = backgroundColor === '#FFFFFF' ? '#F0F0F0' : backgroundColor;
  const lighterColor = backgroundColor === '#FFFFFF' ? '#FFFFFF' : backgroundColor;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor,
        padding,
        borderRadius,
        // Enhanced 3D Beveled Borders
        borderTopWidth: 2,
        borderTopColor: lighterColor,
        borderLeftWidth: 2,
        borderLeftColor: lighterColor,
        borderRightWidth: 2,
        borderRightColor: darkerColor,
        borderBottomWidth: 2,
        borderBottomColor: darkerColor,
        // Enhanced 3D shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    // Base shadow - will be overridden
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});