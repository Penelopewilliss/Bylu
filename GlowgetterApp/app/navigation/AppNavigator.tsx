import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SensoryBreaksScreen from '../screens/SensoryBreaksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkflowGoalsScreen from '../screens/WorkflowGoalsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
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
            title: 'Dashboard',
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            title: 'Calendar',
            tabBarLabel: 'Calendar',
          }}
        />
        <Tab.Screen
          name="Tasks"
          component={TasksScreen}
          options={{
            title: 'Tasks',
            tabBarLabel: 'Tasks',
          }}
        />
        <Tab.Screen
          name="Goals"
          component={WorkflowGoalsScreen}
          options={{
            title: 'Goals',
            tabBarLabel: 'Goals',
          }}
        />
        <Tab.Screen
          name="SensoryBreaks"
          component={SensoryBreaksScreen}
          options={{
            title: 'Sensory Breaks',
            tabBarLabel: 'Breaks',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;