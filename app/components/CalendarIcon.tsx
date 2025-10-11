import React from 'react';
import { View } from 'react-native';

interface CalendarIconProps {
  size?: number;
  color?: string;
}

export default function CalendarIcon({ size = 36, color = '#FFFFFF' }: CalendarIconProps) {
  return (
    <View style={{
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      // Remove background - make container transparent
      backgroundColor: 'transparent',
      // Enhanced transform for more depth (matching emoji style)
      transform: [{ scale: 1.15 }],
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
        // Add drop shadow to the calendar itself only
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 5, // For Android
      }}>
        {/* Calendar Header */}
        <View style={{
          width: '100%',
          height: '30%',
          backgroundColor: '#D1A1B1',
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          // 3D effect for header
          shadowColor: 'rgba(0, 0, 0, 0.15)',
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
          // 3D shadow for rings
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 3,
        }} />
        <View style={{
          position: 'absolute',
          top: -4,
          right: '20%',
          width: 3,
          height: 8,
          backgroundColor: '#D1A1B1',
          borderRadius: 2,
          // 3D shadow for rings
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 3,
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