import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/AuthService';
import { FirestoreService } from '../services/FirestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncDataToCloud: () => Promise<void>;
  loadDataFromCloud: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      
      // If user just signed in, load their data from cloud
      if (firebaseUser) {
        await loadDataFromCloud();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const newUser = await AuthService.signUp(email, password, displayName);
      
      // Sync existing local data to cloud for new user
      await syncDataToCloud();
      
      console.log('✅ Sign up successful, data synced');
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await AuthService.signIn(email, password);
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Optionally sync data before signing out
      await syncDataToCloud();
      await AuthService.signOut();
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncDataToCloud = async () => {
    if (!user) {
      console.log('⚠️ No user logged in, skipping cloud sync');
      return;
    }

    try {
      // Get data from AsyncStorage
      const [alarmsStr, tasksStr, goalsStr, brainDumpStr, settingsStr] = await Promise.all([
        AsyncStorage.getItem('alarms'),
        AsyncStorage.getItem('tasks'),
        AsyncStorage.getItem('goals'),
        AsyncStorage.getItem('brainDump'),
        AsyncStorage.getItem('notificationSettings'),
      ]);

      const data = {
        alarms: alarmsStr ? JSON.parse(alarmsStr) : [],
        tasks: tasksStr ? JSON.parse(tasksStr) : [],
        goals: goalsStr ? JSON.parse(goalsStr) : [],
        brainDump: brainDumpStr ? JSON.parse(brainDumpStr) : [],
        settings: settingsStr ? JSON.parse(settingsStr) : null,
      };

      await FirestoreService.syncAllData(user.uid, data);
      console.log('☁️ Data synced to cloud successfully');
    } catch (error) {
      console.error('❌ Error syncing data to cloud:', error);
    }
  };

  const loadDataFromCloud = async () => {
    if (!user) {
      console.log('⚠️ No user logged in, skipping cloud load');
      return;
    }

    try {
      const cloudData = await FirestoreService.getAllData(user.uid);

      // Save cloud data to AsyncStorage
      if (cloudData.alarms.length > 0) {
        await AsyncStorage.setItem('alarms', JSON.stringify(cloudData.alarms));
      }
      if (cloudData.tasks.length > 0) {
        await AsyncStorage.setItem('tasks', JSON.stringify(cloudData.tasks));
      }
      if (cloudData.goals.length > 0) {
        await AsyncStorage.setItem('goals', JSON.stringify(cloudData.goals));
      }
      if (cloudData.brainDump.length > 0) {
        await AsyncStorage.setItem('brainDump', JSON.stringify(cloudData.brainDump));
      }
      if (cloudData.settings) {
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(cloudData.settings));
      }

      console.log('☁️ Data loaded from cloud successfully');
    } catch (error) {
      console.error('❌ Error loading data from cloud:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        syncDataToCloud,
        loadDataFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
