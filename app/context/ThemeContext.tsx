import React, { createContext, useContext, useState, ReactNode } from 'react';

const lightColors = {
  background: '#FFFFFF',
  cardBackground: '#FEFEFE',
  primary: '#E8B4C4',
  secondary: '#F7D1DA',
  accent: '#B4E8D1',
  lavender: '#DDD6FE',
  peach: '#FECACA',
  text: '#2D2D2D',
  textSecondary: '#6B6B6B',
  textLight: '#9CA3AF',
  border: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.1)',
  buttonBackground: '#E8B4C4',
  buttonText: '#FFFFFF',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  modalContent: '#FFFFFF',
  success: '#10B981',
  progressBg: '#F3F4F6',
  white: '#FFFFFF',
  // Text colors specifically for pink/colored elements
  primaryText: '#000000',
  secondaryText: '#000000',
  accentText: '#000000',
  lavenderText: '#000000',
  peachText: '#000000',
  // Input placeholder text
  placeholderText: '#9CA3AF',
};

const darkColors = {
  background: '#1A1A1A',
  cardBackground: '#2D2D2D',
  primary: '#E8B4C4',
  secondary: '#F7D1DA',
  accent: '#B4E8D1',
  lavender: '#DDD6FE',
  peach: '#FECACA',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#8A8A8A',
  border: '#404040',
  shadow: 'rgba(0, 0, 0, 0.3)',
  buttonBackground: '#E8B4C4',
  buttonText: '#000000',
  modalBackground: 'rgba(0, 0, 0, 0.7)',
  modalContent: '#2D2D2D',
  success: '#10B981',
  progressBg: '#404040',
  white: '#FFFFFF',
  // Text colors specifically for pink/colored elements
  primaryText: '#000000',
  secondaryText: '#000000',
  accentText: '#000000',
  lavenderText: '#000000',
  peachText: '#000000',
  // Input placeholder text
  placeholderText: '#B0B0B0',
};

export type ThemeContextType = {
  isDarkMode: boolean;
  isMilitaryTime: boolean;
  colors: typeof lightColors;
  toggleDarkMode: () => void;
  toggleMilitaryTime: () => void;
  formatTime: (hour: number, minute: number) => string;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMilitaryTime, setIsMilitaryTime] = useState(false);
  const colors = isDarkMode ? darkColors : lightColors;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMilitaryTime = () => {
    setIsMilitaryTime(!isMilitaryTime);
  };

  const formatTime = (hour: number, minute: number): string => {
    if (isMilitaryTime) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }
  };

  const value: ThemeContextType = {
    isDarkMode,
    isMilitaryTime,
    colors,
    toggleDarkMode,
    toggleMilitaryTime,
    formatTime,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
