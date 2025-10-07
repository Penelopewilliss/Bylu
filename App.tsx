import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Dimensions, PanResponder, Animated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { AppProvider } from './app/context/AppContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { OfflineProvider } from './app/context/OfflineContext';
import { CalendarSyncProvider } from './app/context/CalendarSyncContext';
import NotificationService from './app/services/NotificationService';

// Import the actual screen components
import TasksScreen from './app/screens/TasksScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import CalendarScreen from './app/screens/CalendarScreen';
import GoalsScreen from './app/screens/GoalsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import OnboardingScreen from './app/screens/OnboardingScreen';

const { width, height } = Dimensions.get('window');

type TabName = 'Dashboard' | 'Tasks' | 'Calendar' | 'Goals' | 'Settings';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start with a gentle scale-in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000, // Longer fade out
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500); // Extended to 2500ms for more elegance
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
      <Animated.Image 
        source={require('./assets/splash.png')} 
        style={[styles.splashLogo, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

function HamburgerMenu({ 
  activeTab, 
  onTabPress, 
  isVisible, 
  onClose 
}: { 
  activeTab: TabName; 
  onTabPress: (tab: TabName) => void;
  isVisible: boolean;
  onClose: () => void;
}) {
  const tabs: TabName[] = ['Dashboard', 'Calendar', 'Tasks', 'Goals', 'Settings'];

  const getTabEmoji = (tab: TabName): string => {
    switch (tab) {
      case 'Dashboard':
        return '🦋';
      case 'Tasks':
        return '🌺';
      case 'Calendar':
        return '📅';
      case 'Goals':
        return '✨';
      case 'Settings':
        return '🌸';
      default:
        return '';
    }
  };

  const getTabLabel = (tab: TabName): string => {
    switch (tab) {
      case 'Dashboard':
        return 'Home';
      default:
        return tab;
    }
  };

  const handleTabPress = (tab: TabName) => {
    onTabPress(tab);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.dropdownMenu}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.menuItem,
                activeTab === tab && styles.activeMenuItem,
                index === tabs.length - 1 && styles.lastMenuItem // No border on last item
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[
                styles.menuEmoji,
                { color: activeTab === tab ? '#8E1538' : '#A0416B' }
              ]}>
                {getTabEmoji(tab)}
              </Text>
              <Text style={[
                styles.menuLabel,
                { color: activeTab === tab ? '#FFFFFF' : '#8E1538' }
              ]}>
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function TopBar({ 
  activeTab, 
  onMenuPress,
  onHomePress 
}: { 
  activeTab: TabName;
  onMenuPress: () => void;
  onHomePress: () => void;
}) {
  const getTabEmoji = (tab: TabName): string => {
    switch (tab) {
      case 'Dashboard':
        return '🦋';
      case 'Tasks':
        return '🌺';
      case 'Calendar':
        return '📅';
      case 'Goals':
        return '✨';
      case 'Settings':
        return '🌸';
      default:
        return '';
    }
  };

  const getTabLabel = (tab: TabName): string => {
    switch (tab) {
      case 'Dashboard':
        return 'Home';
      default:
        return tab;
    }
  };

  return (
    <View style={styles.topBar}>
      {activeTab !== 'Dashboard' && (
        <TouchableOpacity style={styles.homeButton} onPress={onHomePress}>
          <Text style={styles.homeIcon}>⌂</Text>
        </TouchableOpacity>
      )}
      {activeTab === 'Dashboard' && <View style={styles.spacer} />}
      <View style={styles.currentTab}>
        <Text style={styles.currentTabLabel}>{getTabLabel(activeTab)}</Text>
      </View>
      <TouchableOpacity style={styles.hamburgerButton} onPress={onMenuPress}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>
    </View>
  );
}

function Screen({ activeTab, onNavigate }: { activeTab: TabName; onNavigate: (tab: string) => void }) {
  switch (activeTab) {
    case 'Dashboard':
      return <DashboardScreen onNavigate={onNavigate} />;
    case 'Tasks':
      return <TasksScreen />;
    case 'Calendar':
      return <CalendarScreen />;
    case 'Goals':
      return <GoalsScreen />;
    case 'Settings':
      return <SettingsScreen />;
    default:
      return <DashboardScreen onNavigate={onNavigate} />;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  
  const tabs: TabName[] = ['Dashboard', 'Calendar', 'Tasks', 'Goals', 'Settings'];

  const navigateToTab = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.indexOf(activeTab);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    }
    
    setActiveTab(tabs[newIndex]);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (_, gestureState) => {
      const SWIPE_THRESHOLD = 50;
      
      if (gestureState.dx > SWIPE_THRESHOLD) {
        // Swipe right - go to previous tab
        navigateToTab('prev');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        // Swipe left - go to next tab
        navigateToTab('next');
      }
    },
  });

  useEffect(() => {
    // Load only the working handwritten fonts for splash screen
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'PatrickHand_400Regular': require('./assets/fonts/PatrickHand-Regular.ttf'),
          // Ultra-chic handwritten fonts that are working
          'DancingScript_400Regular': require('./assets/fonts/DancingScript.ttf'),
          'GreatVibes_400Regular': require('./assets/fonts/GreatVibes.ttf'),
          'Allura_400Regular': require('./assets/fonts/Allura.ttf'),
        });
        console.log('✨ Beautiful fonts loaded successfully!');
        setFontsLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        // Fallback: set fonts as loaded anyway so app doesn't get stuck
        setFontsLoaded(true);
      }
    };
    
    loadFonts();
  }, []);

  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('@planner_onboarding_completed');
        console.log('🔍 Onboarding check - stored value:', onboardingCompleted);
        const isCompleted = onboardingCompleted === 'true';
        console.log('🔍 Onboarding check - isCompleted:', isCompleted);
        setIsOnboardingCompleted(isCompleted);
      } catch (error) {
        console.error('Error loading onboarding status:', error);
        setIsOnboardingCompleted(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        await notificationService.initialize();
        console.log('🔔 Notification service initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    initializeNotifications();
  }, []);

  const completeOnboarding = async () => {
    try {
      console.log('✅ Completing onboarding...');
      await AsyncStorage.setItem('@planner_onboarding_completed', 'true');
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  console.log('🎯 App render - isSplashFinished:', isSplashFinished, 'fontsLoaded:', fontsLoaded, 'isOnboardingCompleted:', isOnboardingCompleted);

  if (!isSplashFinished || !fontsLoaded || isOnboardingCompleted === null) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  // Show onboarding for first-time users
  if (!isOnboardingCompleted) {
    console.log('🎉 Showing onboarding screen!');
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  console.log('📱 Showing main app');

  const handleNavigate = (tab: string) => {
    const validTabs: TabName[] = ['Dashboard', 'Calendar', 'Tasks', 'Goals', 'Settings'];
    if (validTabs.includes(tab as TabName)) {
      setActiveTab(tab as TabName);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar 
        activeTab={activeTab} 
        onMenuPress={() => setMenuVisible(true)}
        onHomePress={() => setActiveTab('Dashboard')} 
      />
      <View style={styles.content}>
        <Screen activeTab={activeTab} onNavigate={handleNavigate} />
      </View>
      
      {/* Floating Home Button - Bottom Right */}
      {activeTab !== 'Dashboard' && (
        <TouchableOpacity 
          style={styles.floatingHomeButton} 
          onPress={() => setActiveTab('Dashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingHomeIcon}>⌂</Text>
        </TouchableOpacity>
      )}
      
      <HamburgerMenu
        activeTab={activeTab}
        onTabPress={setActiveTab}
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

export default function App() {
  console.log('Glowgetter App is rendering!');
  
  return (
    <ThemeProvider>
      <AppProvider>
        <OfflineProvider>
          <CalendarSyncProvider>
            <MainApp />
          </CalendarSyncProvider>
        </OfflineProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  splash: {
    flex: 1,
    backgroundColor: '#E8B4C4', // Primary pink color
    alignItems: 'center',
    justifyContent: 'center',
    // Add subtle gradient effect feel
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  splashLogo: {
    width: '100%', // Full width of screen
    height: '100%', // Full height of screen
    position: 'absolute', // Position absolutely to fill container
    top: 0,
    left: 0,
    // Remove shadow for full-screen effect
  },
  screen: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 20,
    color: '#6B6B6B',
    marginBottom: 20,
    textAlign: 'center',
  },
  screenDescription: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  // Top Bar Styles
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7D1DA', // Light pink
    paddingHorizontal: 16,
    paddingVertical: 12, // Increased back up for larger text
    paddingTop: 45, // Increased for larger text
    borderBottomWidth: 0, // Remove border for cleaner look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  currentTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTabEmoji: {
    fontSize: 20,
    marginRight: 8,
    color: '#C2185B',
    display: 'none', // Hide emoji
  },
  currentTabLabel: {
    fontSize: 28, // Increased from 18 to much bigger
    fontWeight: '300', // Light weight for elegant look
    color: '#2D2D2D',
    fontFamily: 'serif', // Elegant serif font
    fontStyle: 'italic', // Add italic for handwritten feel
    letterSpacing: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 34, // Same width as hamburger button to balance the layout
  },
  homeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Subtle white background
    width: 34, // Same as hamburger button
    height: 34,
  },
  homeIcon: {
    fontSize: 18,
    color: '#2D2D2D',
  },
  hamburgerButton: {
    padding: 8, // Reduced from 12
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6, // Smaller radius
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Subtle white background
  },
  hamburgerLine: {
    width: 18, // Slightly smaller
    height: 2,
    backgroundColor: '#2D2D2D',
    marginVertical: 1.5, // Reduced spacing
    borderRadius: 1,
  },
  // Modal and Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: '#F7D1DA', // Match the pink header
    marginTop: 85, // Position perfectly below top bar
    marginRight: 0, // Align with screen edge
    minWidth: 180, // Slightly wider for better text spacing
    shadowColor: '#C2185B', // Pink shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F0B7C4', // Subtle pink border
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, // More padding for better touch area
    paddingVertical: 16, // Increased vertical padding
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 24, 91, 0.1)', // Very subtle pink separator
  },
  activeMenuItem: {
    backgroundColor: '#F5A3B7', // Darker pink for active state
    marginHorizontal: 8, // Inset the active item
    marginVertical: 2, // Small margin for floating effect
  },
  lastMenuItem: {
    borderBottomWidth: 0, // Remove border from last item
  },
  menuEmoji: {
    fontSize: 18, // Slightly larger emoji
    marginRight: 14, // More space between emoji and text
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuLabel: {
    fontSize: 15, // Slightly larger text
    fontWeight: '600', // Bolder text
    color: '#8E1538', // Darker pink for better contrast
    letterSpacing: 0.3, // Slight letter spacing for elegance
  },
  // Legacy tab bar styles (to be removed)
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 10,
    paddingTop: 10,
    height: 70,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  // Floating Home Button Styles
  floatingHomeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7D1DA', // Match the pink header color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fff', // White border for contrast
  },
  floatingHomeIcon: {
    fontSize: 20,
    color: '#2D2D2D', // Dark color to match header icons
    fontWeight: 'bold',
  },
});
