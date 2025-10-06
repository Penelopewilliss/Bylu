import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'task' | 'event' | 'goal' | 'setting';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineStorageService {
  private readonly OFFLINE_QUEUE_KEY = '@Bylu:offline_queue';
  private readonly DATA_PREFIX = '@Bylu:offline_';

  // Save data locally
  async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      const storageKey = `${this.DATA_PREFIX}${key}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`💾 Saved offline data: ${key}`);
    } catch (error) {
      console.error('❌ Failed to save offline data:', error);
      throw error;
    }
  }

  // Get data from local storage
  async getOfflineData(key: string): Promise<any | null> {
    try {
      const storageKey = `${this.DATA_PREFIX}${key}`;
      const data = await AsyncStorage.getItem(storageKey);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get offline data:', error);
      return null;
    }
  }

  // Queue action for later sync
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const newAction: OfflineAction = {
        ...action,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        synced: false,
      };
      
      queue.push(newAction);
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`📥 Queued offline action: ${newAction.type} ${newAction.entity}`);
    } catch (error) {
      console.error('❌ Failed to queue offline action:', error);
    }
  }

  // Get all queued actions
  async getOfflineQueue(): Promise<OfflineAction[]> {
    try {
      const queueData = await AsyncStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('❌ Failed to get offline queue:', error);
      return [];
    }
  }

  // Mark action as synced
  async markActionSynced(actionId: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.map(action => 
        action.id === actionId ? { ...action, synced: true } : action
      );
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('❌ Failed to mark action as synced:', error);
    }
  }

  // Remove synced actions from queue
  async clearSyncedActions(): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const pendingActions = queue.filter(action => !action.synced);
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(pendingActions));
      console.log(`🧹 Cleared ${queue.length - pendingActions.length} synced actions`);
    } catch (error) {
      console.error('❌ Failed to clear synced actions:', error);
    }
  }

  // Get all offline data keys
  async getAllOfflineKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter(key => key.startsWith(this.DATA_PREFIX));
    } catch (error) {
      console.error('❌ Failed to get offline keys:', error);
      return [];
    }
  }

  // Bulk save multiple items
  async saveMultipleOfflineData(items: { key: string; data: any }[]): Promise<void> {
    try {
      const keyValuePairs: [string, string][] = items.map(item => [
        `${this.DATA_PREFIX}${item.key}`,
        JSON.stringify(item.data)
      ]);
      await AsyncStorage.multiSet(keyValuePairs);
      console.log(`💾 Bulk saved ${items.length} offline items`);
    } catch (error) {
      console.error('❌ Failed to bulk save offline data:', error);
      throw error;
    }
  }

  // Clear all offline data (for debugging/reset)
  async clearAllOfflineData(): Promise<void> {
    try {
      const keys = await this.getAllOfflineKeys();
      await AsyncStorage.multiRemove([...keys, this.OFFLINE_QUEUE_KEY]);
      console.log('🧹 Cleared all offline data');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{ totalKeys: number; queueSize: number; dataSize: number }> {
    try {
      const allKeys = await this.getAllOfflineKeys();
      const queue = await this.getOfflineQueue();
      
      return {
        totalKeys: allKeys.length,
        queueSize: queue.length,
        dataSize: queue.filter(action => !action.synced).length
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return { totalKeys: 0, queueSize: 0, dataSize: 0 };
    }
  }
}

// Singleton instance
const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;