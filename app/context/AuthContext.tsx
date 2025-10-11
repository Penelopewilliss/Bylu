import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/AuthService';
import { FirestoreService } from '../services/FirestoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';
import { ERROR_MESSAGES } from '../constants/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncInProgress: boolean;
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
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      logger.auth(`Auth state changed: ${firebaseUser?.email || 'No user'}`);
      setUser(firebaseUser);
      
      // If user just signed in, load their data from cloud
      if (firebaseUser) {
        try {
          await loadDataFromCloud();
        } catch (error) {
          logger.error('Failed to load data from cloud on auth change', error);
        }
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
      
      logger.success('Sign up successful, data synced');
    } catch (error: any) {
      logger.error('Sign up failed', error);
      throw error; // Re-throw to let UI handle the error message
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await AuthService.signIn(email, password);
      logger.success('Sign in successful');
    } catch (error: any) {
      logger.error('Sign in failed', error);
      throw error; // Re-throw to let UI handle the error message
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Optionally sync data before signing out
      try {
        await syncDataToCloud();
      } catch (syncError) {
        // Log sync error but don't block sign out
        logger.warn('Failed to sync data before sign out', syncError);
      }
      await AuthService.signOut();
      logger.success('Sign out successful');
    } catch (error: any) {
      logger.error('Sign out failed', error);
      throw error; // Re-throw to let UI handle the error message
    } finally {
      setLoading(false);
    }
  };

  const syncDataToCloud = async () => {
    if (!user) {
      logger.warn('No user logged in, skipping cloud sync');
      return;
    }

    try {
      setSyncInProgress(true);
      logger.sync('Starting cloud sync...');
      
      // Get data from AsyncStorage with error handling for each item
      const dataPromises = [
        AsyncStorage.getItem('@planner_alarms').catch(() => null),
        AsyncStorage.getItem('@planner_tasks').catch(() => null),
        AsyncStorage.getItem('@planner_goals').catch(() => null),
        AsyncStorage.getItem('@planner_brain_dump').catch(() => null),
        AsyncStorage.getItem('@notification_settings').catch(() => null),
      ];
      
      const [alarmsStr, tasksStr, goalsStr, brainDumpStr, settingsStr] = await Promise.all(dataPromises);

      const data = {
        alarms: alarmsStr ? JSON.parse(alarmsStr) : [],
        tasks: tasksStr ? JSON.parse(tasksStr) : [],
        goals: goalsStr ? JSON.parse(goalsStr) : [],
        brainDump: brainDumpStr ? JSON.parse(brainDumpStr) : [],
        settings: settingsStr ? JSON.parse(settingsStr) : null,
      };

      await FirestoreService.syncAllData(user.uid, data);
      logger.sync('Data synced to cloud successfully');
    } catch (error) {
      logger.error('Error syncing data to cloud', error);
      throw new Error(ERROR_MESSAGES.SYNC_FAILED);
    } finally {
      setSyncInProgress(false);
    }
  };

  const loadDataFromCloud = async () => {
    if (!user) {
      logger.warn('No user logged in, skipping cloud load');
      return;
    }

    try {
      logger.sync('Loading data from cloud...');
      const cloudData = await FirestoreService.getAllData(user.uid);

      // Save cloud data to AsyncStorage with individual error handling
      const savePromises = [];
      
      if (cloudData.alarms.length > 0) {
        savePromises.push(
          AsyncStorage.setItem('@planner_alarms', JSON.stringify(cloudData.alarms))
            .catch(err => logger.warn('Failed to save alarms locally', err))
        );
      }
      if (cloudData.tasks.length > 0) {
        savePromises.push(
          AsyncStorage.setItem('@planner_tasks', JSON.stringify(cloudData.tasks))
            .catch(err => logger.warn('Failed to save tasks locally', err))
        );
      }
      if (cloudData.goals.length > 0) {
        savePromises.push(
          AsyncStorage.setItem('@planner_goals', JSON.stringify(cloudData.goals))
            .catch(err => logger.warn('Failed to save goals locally', err))
        );
      }
      if (cloudData.brainDump.length > 0) {
        savePromises.push(
          AsyncStorage.setItem('@planner_brain_dump', JSON.stringify(cloudData.brainDump))
            .catch(err => logger.warn('Failed to save brain dump locally', err))
        );
      }
      if (cloudData.settings) {
        savePromises.push(
          AsyncStorage.setItem('@notification_settings', JSON.stringify(cloudData.settings))
            .catch(err => logger.warn('Failed to save settings locally', err))
        );
      }

      await Promise.all(savePromises);
      logger.sync('Data loaded from cloud successfully');
    } catch (error) {
      logger.error('Error loading data from cloud', error);
      throw new Error(ERROR_MESSAGES.LOAD_FAILED);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncInProgress,
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
