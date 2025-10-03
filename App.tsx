// App.tsx
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider } from './app/context/AppContext';
import SplashScreen from './app/screens/SplashScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import TasksScreen from './app/screens/TasksScreen';
import CalendarScreen from './app/screens/CalendarScreen';
import SensoryBreaksScreen from './app/screens/SensoryBreaksScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import { Home, ClipboardList, Calendar, Wind, Settings } from 'lucide-react-native';
import Colors from './app/constants/colors';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={() => Font.loadAsync({
          PatrickHand_400Regular: require('./assets/fonts/PatrickHand_400Regular.ttf'),
          Montserrat_400Regular: require('./assets/fonts/Montserrat_400Regular.ttf'),
          Montserrat_600SemiBold: require('./assets/fonts/Montserrat_600SemiBold.ttf'),
        })}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: Colors.primaryDark,
            tabBarInactiveTintColor: Colors.textLight,
            tabBarStyle: { backgroundColor: Colors.white, height: 60 },
            tabBarIcon: ({ color, size }) => {
              switch (route.name) {
                case 'Dashboard':
                  return <Home size={size} />;
                case 'Tasks':
                  return <ClipboardList size={size} />;
                case 'Calendar':
                  return <Calendar size={size} />;
                case 'Breaks':
                  return <Wind size={size} />;
                case 'Settings':
                  return <Settings size={size} />;
                default:
                  return null;
              }
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Tasks" component={TasksScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Breaks" component={SensoryBreaksScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
