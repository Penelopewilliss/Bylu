import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import googleCalendarService from '../services/GoogleCalendarService';
import { useApp } from './AppContext';
import { useOffline } from './OfflineContext';

interface CalendarSyncState {
  isConnected: boolean;
  isAuthenticating: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncEnabled: boolean;
  calendars: any[];
  selectedCalendarId: string;
  syncErrors: string[];
  syncStats: {
    imported: number;
    exported: number;
    updated: number;
  };
}

interface CalendarSyncContextType extends CalendarSyncState {
  // Authentication
  authenticateGoogle: () => Promise<boolean>;
  disconnectGoogle: () => Promise<void>;
  
  // Sync operations
  syncCalendar: () => Promise<void>;
  enableSync: (enabled: boolean) => Promise<void>;
  
  // Calendar management
  loadCalendars: () => Promise<void>;
  selectCalendar: (calendarId: string) => Promise<void>;
  
  // Settings
  setSyncFrequency: (frequency: 'manual' | 'hourly' | 'daily') => Promise<void>;
  getSyncConfig: () => Promise<any>;
}

const CalendarSyncContext = createContext<CalendarSyncContextType | undefined>(undefined);

interface CalendarSyncProviderProps {
  children: ReactNode;
}

export const CalendarSyncProvider: React.FC<CalendarSyncProviderProps> = ({ children }) => {
  const { events, addEvent, updateEvent } = useApp();
  const { isOnline } = useOffline();
  
  const [state, setState] = useState<CalendarSyncState>({
    isConnected: false,
    isAuthenticating: false,
    isSyncing: false,
    lastSyncTime: null,
    syncEnabled: false,
    calendars: [],
    selectedCalendarId: 'primary',
    syncErrors: [],
    syncStats: {
      imported: 0,
      exported: 0,
      updated: 0,
    },
  });

  // Initialize calendar sync state
  useEffect(() => {
    initializeCalendarSync();
  }, []);

  // Auto-sync when online and sync is enabled
  useEffect(() => {
    if (isOnline && state.syncEnabled && state.isConnected && !state.isSyncing) {
      // Check if it's time for auto-sync based on frequency
      checkAutoSync();
    }
  }, [isOnline, state.syncEnabled, state.isConnected]);

  const initializeCalendarSync = async () => {
    try {
      const isConnected = googleCalendarService.isConnected();
      const lastSyncTime = googleCalendarService.getLastSyncTime();
      const config = await googleCalendarService.getSyncConfig();
      
      setState(prev => ({
        ...prev,
        isConnected,
        lastSyncTime,
        syncEnabled: config.enabled,
        selectedCalendarId: config.defaultCalendarId,
      }));

      if (isConnected) {
        await loadCalendars();
      }

      console.log('📅 Calendar sync context initialized');
    } catch (error) {
      console.error('❌ Failed to initialize calendar sync:', error);
    }
  };

  const checkAutoSync = async () => {
    try {
      const config = await googleCalendarService.getSyncConfig();
      const lastSync = new Date(state.lastSyncTime || 0);
      const now = new Date();
      const timeDiff = now.getTime() - lastSync.getTime();
      
      let shouldSync = false;
      
      switch (config.syncFrequency) {
        case 'hourly':
          shouldSync = timeDiff > 60 * 60 * 1000; // 1 hour
          break;
        case 'daily':
          shouldSync = timeDiff > 24 * 60 * 60 * 1000; // 24 hours
          break;
        default:
          shouldSync = false; // Manual only
      }
      
      if (shouldSync) {
        console.log('⏰ Auto-sync triggered');
        await syncCalendar();
      }
    } catch (error) {
      console.error('❌ Error checking auto-sync:', error);
    }
  };

  const authenticateGoogle = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isAuthenticating: true, syncErrors: [] }));
      
      const success = await googleCalendarService.authenticate();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          syncEnabled: true,
        }));
        
        await loadCalendars();
        console.log('✅ Google Calendar connected successfully');
      } else {
        setState(prev => ({
          ...prev,
          syncErrors: ['Failed to authenticate with Google Calendar'],
        }));
      }
      
      setState(prev => ({ ...prev, isAuthenticating: false }));
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        syncErrors: [`Authentication error: ${errorMessage}`],
      }));
      console.error('❌ Google Calendar authentication failed:', error);
      return false;
    }
  };

  const disconnectGoogle = async (): Promise<void> => {
    try {
      await googleCalendarService.disconnect();
      setState(prev => ({
        ...prev,
        isConnected: false,
        syncEnabled: false,
        calendars: [],
        syncErrors: [],
        lastSyncTime: null,
      }));
      console.log('📅 Google Calendar disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Google Calendar:', error);
    }
  };

  const loadCalendars = async (): Promise<void> => {
    try {
      if (!state.isConnected || !isOnline) {
        return;
      }
      
      const calendars = await googleCalendarService.getCalendars();
      setState(prev => ({ ...prev, calendars }));
      console.log(`📅 Loaded ${calendars.length} calendars`);
    } catch (error) {
      console.error('❌ Error loading calendars:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        syncErrors: [`Failed to load calendars: ${errorMessage}`],
      }));
    }
  };

  const selectCalendar = async (calendarId: string): Promise<void> => {
    try {
      await googleCalendarService.updateSyncConfig({
        defaultCalendarId: calendarId,
      });
      
      setState(prev => ({ ...prev, selectedCalendarId: calendarId }));
      console.log(`📅 Selected calendar: ${calendarId}`);
    } catch (error) {
      console.error('❌ Error selecting calendar:', error);
    }
  };

  const syncCalendar = async (): Promise<void> => {
    try {
      if (!state.isConnected || !isOnline || state.isSyncing) {
        return;
      }

      setState(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));
      console.log('🔄 Starting calendar sync...');

      // Get current events in the local format expected by the service
      const localEvents = events.map(event => ({
        ...event,
        googleId: event.googleId || null,
        lastSyncTime: event.lastSyncTime || null,
      }));

      const result = await googleCalendarService.syncEvents(localEvents);
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncStats: {
          imported: result.imported,
          exported: result.exported,
          updated: result.updated,
        },
        syncErrors: result.errors,
      }));

      if (result.errors.length === 0) {
        console.log('✅ Calendar sync completed successfully');
      } else {
        console.log(`⚠️ Calendar sync completed with ${result.errors.length} errors`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncErrors: [`Sync failed: ${errorMessage}`],
      }));
      console.error('❌ Calendar sync failed:', error);
    }
  };

  const enableSync = async (enabled: boolean): Promise<void> => {
    try {
      await googleCalendarService.updateSyncConfig({ enabled });
      setState(prev => ({ ...prev, syncEnabled: enabled }));
      
      if (enabled && state.isConnected && isOnline) {
        await syncCalendar();
      }
      
      console.log(`📅 Calendar sync ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Error updating sync setting:', error);
    }
  };

  const setSyncFrequency = async (frequency: 'manual' | 'hourly' | 'daily'): Promise<void> => {
    try {
      await googleCalendarService.updateSyncConfig({ syncFrequency: frequency });
      console.log(`📅 Sync frequency set to: ${frequency}`);
    } catch (error) {
      console.error('❌ Error setting sync frequency:', error);
    }
  };

  const getSyncConfig = async (): Promise<any> => {
    try {
      return await googleCalendarService.getSyncConfig();
    } catch (error) {
      console.error('❌ Error getting sync config:', error);
      return null;
    }
  };

  const contextValue: CalendarSyncContextType = {
    ...state,
    authenticateGoogle,
    disconnectGoogle,
    syncCalendar,
    enableSync,
    loadCalendars,
    selectCalendar,
    setSyncFrequency,
    getSyncConfig,
  };

  return (
    <CalendarSyncContext.Provider value={contextValue}>
      {children}
    </CalendarSyncContext.Provider>
  );
};

export const useCalendarSync = (): CalendarSyncContextType => {
  const context = useContext(CalendarSyncContext);
  if (!context) {
    throw new Error('useCalendarSync must be used within a CalendarSyncProvider');
  }
  return context;
};