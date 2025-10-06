import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import networkService from '../services/NetworkService';
import syncService from '../services/SyncService';
import offlineStorageService from '../services/OfflineStorageService';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  saveOfflineData: (key: string, data: any) => Promise<void>;
  getOfflineData: (key: string) => Promise<any>;
  addToSyncQueue: (type: 'CREATE' | 'UPDATE' | 'DELETE', entity: 'task' | 'event' | 'goal' | 'setting', data: any) => Promise<void>;
  forceSync: () => Promise<void>;
  getStorageStats: () => Promise<{ totalKeys: number; queueSize: number; dataSize: number }>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    // Initialize network status
    setIsOnline(networkService.getNetworkStatus());

    // Listen for network changes
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      console.log(`🌐 Network status changed: ${online ? 'Online' : 'Offline'}`);
      
      if (online) {
        updatePendingActionsCount();
      } else {
        setIsSyncing(false);
      }
    };

    // Subscribe to network events using the new listener pattern
    networkService.addListener(handleNetworkChange);

    // Update pending actions count initially
    updatePendingActionsCount();

    // Cleanup
    return () => {
      networkService.removeListener(handleNetworkChange);
    };
  }, []);

  const updatePendingActionsCount = async () => {
    try {
      const queue = await offlineStorageService.getOfflineQueue();
      const pending = queue.filter(action => !action.synced).length;
      setPendingActions(pending);
    } catch (error) {
      console.error('❌ Failed to update pending actions count:', error);
    }
  };

  const saveOfflineData = async (key: string, data: any): Promise<void> => {
    try {
      await offlineStorageService.saveOfflineData(key, data);
      console.log(`💾 Saved data offline: ${key}`);
    } catch (error) {
      console.error('❌ Failed to save offline data:', error);
      throw error;
    }
  };

  const getOfflineData = async (key: string): Promise<any> => {
    try {
      return await offlineStorageService.getOfflineData(key);
    } catch (error) {
      console.error('❌ Failed to get offline data:', error);
      return null;
    }
  };

  const addToSyncQueue = async (
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'task' | 'event' | 'goal' | 'setting',
    data: any
  ): Promise<void> => {
    try {
      await syncService.addToSyncQueue(type, entity, data);
      await updatePendingActionsCount();
      console.log(`📥 Added to sync queue: ${type} ${entity}`);
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
      throw error;
    }
  };

  const forceSync = async (): Promise<void> => {
    if (!isOnline) {
      console.warn('⚠️ Cannot sync while offline');
      return;
    }

    try {
      setIsSyncing(true);
      await syncService.forcSync();
      await updatePendingActionsCount();
      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('❌ Force sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStorageStats = async () => {
    return await offlineStorageService.getStorageStats();
  };

  const value: OfflineContextType = {
    isOnline,
    isSyncing,
    pendingActions,
    saveOfflineData,
    getOfflineData,
    addToSyncQueue,
    forceSync,
    getStorageStats
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext;