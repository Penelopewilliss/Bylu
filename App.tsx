import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Dimensions, PanResponder, Animated, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './app/context/AppContext';
import { ThemeProvider } from './app/context/ThemeContext';
import { OfflineProvider } from './app/context/OfflineContext';
import { CalendarSyncProvider } from './app/context/CalendarSyncContext';
import CalendarIcon from './app/components/CalendarIcon';
import NotificationService from './app/services/NotificationService';

// Import the actual screen components
import HomeScreen from './app/screens/HomeScreen';
import TasksScreen from './app/screens/TasksScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import CalendarScreen from './app/screens/CalendarScreen';
import GoalsScreen from './app/screens/GoalsScreen';
import BrainDumpScreen from './app/screens/BrainDumpScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import AlarmClockScreen from './app/screens/AlarmClockScreen';
import AlarmActiveScreen from './app/screens/AlarmActiveScreen';
import OnboardingScreen from './app/screens/OnboardingScreen';

const { width, height } = Dimensions.get('window');

type TabName = 'Home' | 'Dashboard' | 'Tasks' | 'Calendar' | 'Goals' | 'BrainDump' | 'AlarmClock' | 'Settings';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start with a gentle scale-in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Add a subtle rotation animation for loading effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, Platform.OS === 'web' ? 2000 : 2500); // 2.5 seconds for mobile, 2 seconds for web
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, rotateAnim, onFinish]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
      <Animated.Image 
        source={require('./assets/splash.png')} 
        style={[styles.splashLogo, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="cover"
      />
      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingSpinner, { transform: [{ rotate: spin }] }]}>
          <Text style={styles.loadingEmoji}>🌸</Text>
        </Animated.View>
      </View>
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
  const tabs: TabName[] = ['Home', 'Dashboard', 'Calendar', 'Tasks', 'Goals', 'BrainDump', 'AlarmClock', 'Settings'];

  const getTabEmoji = (tab: TabName): string => {
    switch (tab) {
      case 'Home':
        return '🏠';
      case 'Dashboard':
        return '🦋';
      case 'Tasks':
        return '🌺';
      case 'Calendar':
        return '�️';
      case 'Goals':
        return '✨';
      case 'BrainDump':
        return '💭';
      case 'AlarmClock':
        return '⏰';
      case 'Settings':
        return '🌸';
      default:
        return '';
    }
  };

  const getTabLabel = (tab: TabName): string => {
    switch (tab) {
      case 'Home':
        return 'Home';
      case 'Dashboard':
        return 'Dashboard';
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
              <View style={styles.menuEmoji}>
                {tab === 'Calendar' ? (
                  <CalendarIcon 
                    size={20} 
                    color={activeTab === tab ? '#8E1538' : '#A0416B'} 
                    reduced3D={true}
                  />
                ) : (
                  <Text style={[
                    styles.menuEmojiText,
                    { color: activeTab === tab ? '#8E1538' : '#A0416B' }
                  ]}>
                    {getTabEmoji(tab)}
                  </Text>
                )}
              </View>
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
      case 'Home':
        return '🏠';
      case 'Dashboard':
        return '🦋';
      case 'Tasks':
        return '🌺';
      case 'Calendar':
        return '�️';
      case 'Goals':
        return '✨';
      case 'BrainDump':
        return '💭';
      case 'AlarmClock':
        return '⏰';
      case 'Settings':
        return '🌸';
      default:
        return '';
    }
  };

  const getTabLabel = (tab: TabName): string => {
    switch (tab) {
      case 'Home':
        return 'Home';
      case 'Dashboard':
        return 'Dashboard';
      default:
        return tab;
    }
  };

  return (
    <View style={styles.topBar}>
      {activeTab !== 'Home' && (
        <TouchableOpacity style={styles.homeButton} onPress={onHomePress}>
          <Text style={styles.homeIcon}>⌂</Text>
        </TouchableOpacity>
      )}
      {activeTab === 'Home' && <View style={styles.spacer} />}
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

function Screen({ activeTab, onNavigate, deepLink, onClearDeepLink, onSetDeepLink }: { activeTab: TabName; onNavigate: (tab: string) => void; deepLink?: any; onClearDeepLink?: () => void; onSetDeepLink?: (deepLink: any) => void }) {
  switch (activeTab) {
    case 'Home':
      return <HomeScreen onNavigate={onNavigate} onSetDeepLink={onSetDeepLink} />;
    case 'Dashboard':
      return <DashboardScreen onNavigate={onNavigate} />;
    case 'Tasks':
      return <TasksScreen deepLink={deepLink} onDeepLinkHandled={onClearDeepLink} />;
    case 'Calendar':
      return <CalendarScreen deepLink={deepLink} onDeepLinkHandled={onClearDeepLink} />;
    case 'Goals':
      return <GoalsScreen deepLink={deepLink} onDeepLinkHandled={onClearDeepLink} />;
    case 'BrainDump':
      return <BrainDumpScreen deepLink={deepLink} onDeepLinkHandled={onClearDeepLink} />;
    case 'AlarmClock':
      return <AlarmClockScreen onNavigate={onNavigate} deepLink={deepLink} onDeepLinkHandled={onClearDeepLink} />;
    case 'Settings':
      return <SettingsScreen />;
    default:
      return <DashboardScreen onNavigate={onNavigate} />;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [deepLink, setDeepLink] = useState<any>(null);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  
  // Alarm state
  const [showAlarmScreen, setShowAlarmScreen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<any>(null);
  
  const tabs: TabName[] = ['Home', 'Dashboard', 'Calendar', 'Tasks', 'Goals', 'BrainDump', 'AlarmClock', 'Settings'];

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
    
    // Listen for notifications when they arrive (automatic trigger)
    const notificationSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
      try {
        const data = notification?.request?.content?.data;
        const identifier = notification?.request?.identifier;
        console.log('🔔 Notification received automatically', data, identifier);
        
        // Check if this is an alarm notification
        if (identifier && identifier.startsWith('alarm-')) {
          // Extract alarm information from the notification
          const alarmData = {
            id: identifier,
            title: notification?.request?.content?.title || 'Alarm',
            body: notification?.request?.content?.body || 'Time to wake up!',
            sound: notification?.request?.content?.sound,
            ...data, // Include any additional alarm data
          };
          
          console.log('⏰ Alarm notification auto-triggered:', alarmData);
          setActiveAlarm(alarmData);
          setShowAlarmScreen(true);
        }
      } catch (err) {
        console.error('Failed handling automatic notification', err);
      }
    });
    
    // Listen for notification responses (user taps)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      try {
        const data = response?.notification?.request?.content?.data;
        const identifier = response?.notification?.request?.identifier;
        console.log('📲 Notification response received', data, identifier);
        
        // Check if this is an alarm notification
        if (identifier && identifier.startsWith('alarm-')) {
          // Extract alarm information from the notification
          const alarmData = {
            id: identifier,
            title: response?.notification?.request?.content?.title || 'Alarm',
            body: response?.notification?.request?.content?.body || 'Time to wake up!',
            sound: response?.notification?.request?.content?.sound,
          };
          
          console.log('⏰ Alarm notification triggered:', alarmData);
          setActiveAlarm(alarmData);
          setShowAlarmScreen(true);
        } else if (data?.type === 'priority-reminder' || data?.type === 'priority-reminder-test') {
          // Navigate to Tasks tab and set deep link payload so TasksScreen can open high-priority view
          setActiveTab('Tasks');
          setDeepLink({ type: data.type, timeSlot: data?.timeSlot });
        }
      } catch (err) {
        console.error('Failed handling notification response', err);
      }
    });

    return () => {
      try {
        notificationSubscription.remove();
        responseSubscription.remove();
      } catch (e) {
        // ignore
      }
    };
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
    const validTabs: TabName[] = ['Home', 'Dashboard', 'Calendar', 'Tasks', 'Goals', 'BrainDump', 'AlarmClock', 'Settings'];
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
        onHomePress={() => setActiveTab('Home')} 
      />
      <View style={styles.content}>
        <Screen 
          activeTab={activeTab} 
          onNavigate={handleNavigate} 
          deepLink={deepLink} 
          onClearDeepLink={() => setDeepLink(null)}
          onSetDeepLink={setDeepLink}
        />
      </View>
      
      {/* Floating Home Button - Bottom Right */}
      {activeTab !== 'Home' && (
        <TouchableOpacity 
          style={[
            styles.floatingHomeButton,
            activeTab === 'Tasks' && styles.floatingHomeButtonTasks
          ]} 
          onPress={() => setActiveTab('Home')}
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
      
      {/* Alarm Active Screen - Full Screen Overlay */}
      {showAlarmScreen && activeAlarm && (
        <AlarmActiveScreen
          alarm={activeAlarm}
          visible={showAlarmScreen}
          onDismiss={() => {
            setShowAlarmScreen(false);
            setActiveAlarm(null);
          }}
          onSnooze={(minutes) => {
            console.log(`⏰ Alarm snoozed for ${minutes} minutes`);
            setShowAlarmScreen(false);
            setActiveAlarm(null);
            // TODO: Schedule snooze notification
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  console.log('Glowgetter App is rendering!');
  
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <OfflineProvider>
            <CalendarSyncProvider>
              <MainApp />
            </CalendarSyncProvider>
          </OfflineProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
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
  loadingContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'GreatVibes', // Use the beautiful handwritten font
    letterSpacing: 1,
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
    backgroundColor: '#E8B4C4', // Match the action card color
    paddingHorizontal: 16,
    paddingVertical: 12, // Increased back up for larger text
    paddingTop: 45, // Increased for larger text
    // Enhanced 3D shadow effects like action cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // 3D beveled borders like action cards
    borderBottomWidth: 3,
    borderBottomColor: '#D1A1B1', // Darker bottom edge for 3D effect
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
    fontWeight: '700', // Bolder weight for 3D effect
    color: '#000000', // Black text like action cards
    // Enhanced 3D text shadow effects
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.8, // Better spacing for 3D appearance
    fontFamily: 'serif', // Elegant serif font
    fontStyle: 'italic', // Add italic for handwritten feel
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for more dramatic effect
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: '#E8B4C4', // Match the action card color
    marginTop: 85, // Position perfectly below top bar
    marginRight: 0, // Align with screen edge
    minWidth: 180, // Slightly wider for better text spacing
    // Enhanced 3D shadow effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // 3D beveled borders
    borderTopWidth: 2,
    borderTopColor: '#F0C7D1',
    borderLeftWidth: 2,
    borderLeftColor: '#F0C7D1',
    borderRightWidth: 2,
    borderRightColor: '#D1A1B1',
    borderBottomWidth: 2,
    borderBottomColor: '#D1A1B1',
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, // More padding for better touch area
    paddingVertical: 16, // Increased vertical padding
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(209, 161, 177, 0.3)', // Subtle pink separator
    // Slight 3D effect
    backgroundColor: 'transparent',
  },
  activeMenuItem: {
    backgroundColor: '#D1A1B1', // Darker pink for active state
    marginHorizontal: 8, // Inset the active item
    marginVertical: 2, // Small margin for floating effect
    borderRadius: 8,
    // Enhanced 3D effect for active item
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lastMenuItem: {
    borderBottomWidth: 0, // Remove border from last item
  },
  menuEmoji: {
    marginRight: 14, // More space between emoji and text
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  menuEmojiText: {
    fontSize: 18, // Slightly larger emoji
    // Enhanced 3D text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuLabel: {
    fontSize: 15, // Slightly larger text
    fontWeight: '700', // Bolder text for 3D effect
    color: '#000000', // Black text for better contrast
    letterSpacing: 0.5, // Better spacing for 3D appearance
    // Enhanced 3D text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    bottom: 80, // Reduced from 100 to move button slightly down
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8B4C4', // Match the action card color
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced 3D shadow effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // 3D beveled borders
    borderTopWidth: 2,
    borderTopColor: '#F0C7D1',
    borderLeftWidth: 2,
    borderLeftColor: '#F0C7D1',
    borderRightWidth: 2,
    borderRightColor: '#D1A1B1',
    borderBottomWidth: 2,
    borderBottomColor: '#D1A1B1',
    borderWidth: 2,
    borderColor: '#fff', // White border for contrast
  },
  floatingHomeButtonTasks: {
    bottom: 120, // Higher position for Tasks page only
    right: 20,   // Keep on right side for Tasks page
  },
  floatingHomeIcon: {
    fontSize: 20,
    color: '#000000', // Black color to match other elements
    fontWeight: 'bold',
    // Enhanced 3D text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
});
