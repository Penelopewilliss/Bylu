import React from 'react';
import { View } from 'react-native';

interface CalendarIconProps {
  size?: number;
  color?: string;
  reduced3D?: boolean; // New prop for reduced 3D effects
}

export default function CalendarIcon({ size = 36, color = '#FFFFFF', reduced3D = false }: CalendarIconProps) {
  return (
    <View style={{
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: reduced3D ? 0 : 10, // No margin for dropdown menu
      // Remove background - make container transparent
      backgroundColor: 'transparent',
      // Enhanced transform for more depth (matching emoji style)
      transform: reduced3D ? [] : [{ scale: 1.15 }],
    }}>
      {/* Calendar Body */}
      <View style={{
        width: size * 0.8,
        height: size * 0.7,
        backgroundColor: color,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#D1A1B1',
        position: 'relative',
        // Add drop shadow to the calendar itself only - reduced for dropdown
        shadowColor: reduced3D ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.25)',
        shadowOffset: reduced3D ? { width: 1, height: 1 } : { width: 2, height: 4 },
        shadowOpacity: 1,
        shadowRadius: reduced3D ? 2 : 6,
        elevation: reduced3D ? 2 : 5, // For Android
      }}>
        {/* Calendar Header */}
        <View style={{
          width: '100%',
          height: '30%',
          backgroundColor: '#D1A1B1',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          // 3D effect for header - reduced for dropdown
          shadowColor: reduced3D ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.15)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 1,
        }} />
        
        {/* Calendar Rings */}
        <View style={{
          position: 'absolute',
          top: -4,
          left: '20%',
          width: 3,
          height: 8,
          backgroundColor: '#D1A1B1',
          borderRadius: 2,
          // 3D shadow for rings - reduced for dropdown
          shadowColor: reduced3D ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.2)',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: reduced3D ? 1 : 2,
          elevation: reduced3D ? 1 : 3,
        }} />
        <View style={{
          position: 'absolute',
          top: -4,
          right: '20%',
          width: 3,
          height: 8,
          backgroundColor: '#D1A1B1',
          borderRadius: 2,
          // 3D shadow for rings - reduced for dropdown
          shadowColor: reduced3D ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.2)',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: reduced3D ? 1 : 2,
          elevation: reduced3D ? 1 : 3,
        }} />
        
        {/* Calendar Grid Lines */}
        <View style={{
          position: 'absolute',
          bottom: '40%',
          left: '10%',
          right: '10%',
          height: 1,
          backgroundColor: '#E89BAB',
          opacity: 0.5,
        }} />
        <View style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          right: '10%',
          height: 1,
          backgroundColor: '#E89BAB',
          opacity: 0.5,
        }} />
      </View>
    </View>
  );
}