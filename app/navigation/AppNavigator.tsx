import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, Text } from 'react-native';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GoalsScreen from '../screens/GoalsScreen';

const Tab = createBottomTabNavigator();

// Simple Home Button for headers
const HeaderHomeButton = ({ navigation }: { navigation: any }) => (
  <TouchableOpacity 
    onPress={() => navigation.navigate('Dashboard')}
    style={{
      marginLeft: 15,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FFFFFF',
    }}
    activeOpacity={0.7}
  >
    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>🏠</Text>
  </TouchableOpacity>
);

const AppNavigator = () => {
  // Updated navigation order: Home, Calendar, Tasks, Goals, Settings
  return (
    <NavigationContainer>
      <Tab.Navigator
        id={undefined}
        initialRouteName="Dashboard"
        screenOptions={{
          tabBarActiveTintColor: '#F7D1DA',
          tabBarInactiveTintColor: '#8E8E8E',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
          headerStyle: {
            backgroundColor: '#F7D1DA',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: '🦋 Dashboard',
            tabBarLabel: '🦋 Home',
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={({ navigation }) => ({
            title: '📅 Calendar',
            tabBarLabel: '📅 Calendar',
            headerLeft: () => <HeaderHomeButton navigation={navigation} />,
          })}
        />
        <Tab.Screen
          name="Tasks"
          component={TasksScreen}
          options={({ navigation }) => ({
            title: '🌺 Tasks',
            tabBarLabel: '🌺 Tasks',
            headerLeft: () => <HeaderHomeButton navigation={navigation} />,
          })}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsScreen}
          options={({ navigation }) => ({
            title: '✨ Goals',
            tabBarLabel: '✨ Goals',
            headerLeft: () => <HeaderHomeButton navigation={navigation} />,
          })}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation }) => ({
            title: '🌸 Settings',
            tabBarLabel: '🌸 Settings',
            headerLeft: () => <HeaderHomeButton navigation={navigation} />,
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;