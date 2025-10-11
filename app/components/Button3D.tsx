import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

interface Button3DProps {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
  numberOfLines?: number;
}

export default function Button3D({ 
  title, 
  onPress, 
  backgroundColor = '#E8B4C4', 
  textColor = '#000000',
  size = 'medium',
  style,
  disabled = false,
  numberOfLines = undefined
}: Button3DProps) {
  
  const getSizeStyles = () => {
    switch(size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
        };
    }
  };

  // Function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Function to convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Function to create lighter color
  const lightenColor = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex);
    const newR = Math.min(255, Math.round(r + (255 - r) * percent));
    const newG = Math.min(255, Math.round(g + (255 - g) * percent));
    const newB = Math.min(255, Math.round(b + (255 - b) * percent));
    return rgbToHex(newR, newG, newB);
  };

  // Function to create darker color
  const darkenColor = (hex: string, percent: number) => {
    const { r, g, b } = hexToRgb(hex);
    const newR = Math.max(0, Math.round(r * (1 - percent)));
    const newG = Math.max(0, Math.round(g * (1 - percent)));
    const newB = Math.max(0, Math.round(b * (1 - percent)));
    return rgbToHex(newR, newG, newB);
  };

  const sizeStyles = getSizeStyles();
  
  // Generate proper 3D colors for any background color
  const lighterColor = backgroundColor === '#FFFFFF' 
    ? '#F0F0F0'  // Special case for white - use light gray
    : lightenColor(backgroundColor, 0.2);
    
  const darkerColor = backgroundColor === '#FFFFFF'
    ? '#D0D0D0'  // Special case for white - use darker gray
    : darkenColor(backgroundColor, 0.2);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? darkerColor : backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          // Enhanced 3D Beveled Borders
          borderTopWidth: 3,
          borderTopColor: lighterColor,
          borderLeftWidth: 2,
          borderLeftColor: lighterColor,
          borderRightWidth: 2,
          borderRightColor: darkerColor,
          borderBottomWidth: 3,
          borderBottomColor: darkerColor,
          // 3D press effect
          transform: pressed 
            ? [
                { perspective: 1200 },
                { rotateX: '3deg' },
                { scale: 0.95 },
                { translateY: 2 }
              ]
            : [
                { perspective: 1200 },
                { rotateX: '1deg' },
                { scale: 1 },
                { translateY: 0 }
              ],
          // Dynamic shadow
          shadowOffset: pressed 
            ? { width: 1, height: 4 }
            : { width: 0, height: 8 },
          shadowOpacity: pressed ? 0.15 : 0.25,
          shadowRadius: pressed ? 6 : 12,
          elevation: pressed ? 6 : 12,
          opacity: disabled ? 0.5 : 1,
        },
        style
      ]}
    >
      <Text style={[
        styles.buttonText,
        {
          color: textColor || '#000000',
          fontSize: sizeStyles.fontSize,
        },
        // Force text color for mobile compatibility
        Platform.OS !== 'web' && { color: textColor || '#000000' }
      ]}
      numberOfLines={numberOfLines}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    // Base shadow styles - will be overridden by dynamic values
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // Enhanced web compatibility
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.25), inset 2px 2px 4px rgba(255, 255, 255, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.2)',
    }),
  },
  buttonText: {
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Montserrat-SemiBold',
      android: 'Montserrat-SemiBold',
      default: 'system font, -apple-system, BlinkMacSystemFont, sans-serif'
    }),
    // Enhanced 3D text shadow - adjusted for better visibility
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 0.5,
    textAlign: 'center',
    // Enhanced web compatibility - removed white text shadow
    ...(Platform.OS === 'web' && {
      textShadow: '0px 1px 1px rgba(255, 255, 255, 0.1)',
      fontFamily: 'Montserrat-SemiBold, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    }),
  },
});