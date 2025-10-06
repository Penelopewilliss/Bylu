import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Dimensions, PanResponder, Animated, Image } from 'react-native';
import * as Font from 'expo-font';
import { AppProvider } from './app/context/AppContext';
import { ThemeProvider } from './app/context/ThemeContext';

// Import the actual screen components
import TasksScreen from './app/screens/TasksScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import CalendarScreen from './app/screens/CalendarScreen';
import GoalsScreen from './app/screens/GoalsScreen';
import SettingsScreen from './app/screens/SettingsScreen';

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
        source={require('./assets/icon.png')} 
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
  const tabs: TabName[] = ['Dashboard', 'Tasks', 'Calendar', 'Goals', 'Settings'];

  const getTabEmoji = (tab: TabName): string => {
    switch (tab) {
      case 'Dashboard':
        return '🏠';
      case 'Tasks':
        return '✓';
      case 'Calendar':
        return '📅';
      case 'Goals':
        return '🎯';
      case 'Settings':
        return '⚙️';
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
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.menuItem,
                activeTab === tab && styles.activeMenuItem
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[
                styles.menuEmoji,
                { color: activeTab === tab ? '#C2185B' : '#6B6B6B' }
              ]}>
                {getTabEmoji(tab)}
              </Text>
              <Text style={[
                styles.menuLabel,
                { color: activeTab === tab ? '#C2185B' : '#2D2D2D' }
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
  onMenuPress 
}: { 
  activeTab: TabName;
  onMenuPress: () => void;
}) {
  const getTabEmoji = (tab: TabName): string => {
    switch (tab) {
      case 'Dashboard':
        return '🏠';
      case 'Tasks':
        return '✓';
      case 'Calendar':
        return '📅';
      case 'Goals':
        return '🎯';
      case 'Settings':
        return '⚙️';
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
      <View style={styles.spacer} />
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

function Screen({ activeTab, onNavigate }: { activeTab: TabName; onNavigate: (tab: TabName) => void }) {
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
  
  const tabs: TabName[] = ['Dashboard', 'Tasks', 'Calendar', 'Goals', 'Settings'];

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

  if (!isSplashFinished || !fontsLoaded) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar 
        activeTab={activeTab} 
        onMenuPress={() => setMenuVisible(true)} 
      />
      <View style={styles.content}>
        <Screen activeTab={activeTab} onNavigate={setActiveTab} />
      </View>
      
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
        <MainApp />
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
    backgroundColor: '#FFFFFF',
    marginTop: 95, // Position below top bar
    marginRight: 16,
    borderRadius: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeMenuItem: {
    backgroundColor: '#FFF8F9',
  },
  menuEmoji: {
    fontSize: 16,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
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
});
