import networkService from './NetworkService';
import offlineStorageService, { OfflineAction } from './OfflineStorageService';

class SyncService {
  private isSyncing: boolean = false;
  private syncInProgress: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for network changes using the new listener pattern
    const handleNetworkChange = (isOnline: boolean) => {
      if (isOnline) {
        console.log('🔄 Network back online - starting sync');
        this.startSync();
      } else {
        console.log('📱 Network offline - sync paused');
        this.isSyncing = false;
      }
    };

    networkService.addListener(handleNetworkChange);
  }

  // Start syncing queued actions
  async startSync(): Promise<void> {
    if (this.syncInProgress || !networkService.isNetworkAvailable()) {
      return;
    }

    this.syncInProgress = true;
    this.isSyncing = true;

    try {
      console.log('🔄 Starting offline sync...');
      const queue = await offlineStorageService.getOfflineQueue();
      const pendingActions = queue.filter(action => !action.synced);

      if (pendingActions.length === 0) {
        console.log('✅ No pending actions to sync');
        this.syncInProgress = false;
        return;
      }

      console.log(`📤 Syncing ${pendingActions.length} pending actions`);

      for (const action of pendingActions) {
        if (!networkService.isNetworkAvailable()) {
          console.log('🚫 Network lost during sync - stopping');
          break;
        }

        try {
          await this.syncAction(action);
          await offlineStorageService.markActionSynced(action.id);
          console.log(`✅ Synced action: ${action.type} ${action.entity}`);
        } catch (error) {
          console.error(`❌ Failed to sync action ${action.id}:`, error);
          // Continue with other actions even if one fails
        }
      }

      // Clean up synced actions
      await offlineStorageService.clearSyncedActions();
      console.log('🧹 Sync completed - cleaned up synced actions');

    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
      this.isSyncing = false;
    }
  }

  // Sync individual action
  private async syncAction(action: OfflineAction): Promise<void> {
    console.log(`🔄 Syncing ${action.type} ${action.entity}:`, action.data);

    // Simulate API calls (replace with real API endpoints)
    switch (action.entity) {
      case 'task':
        await this.syncTask(action);
        break;
      case 'event':
        await this.syncEvent(action);
        break;
      case 'goal':
        await this.syncGoal(action);
        break;
      case 'setting':
        await this.syncSetting(action);
        break;
      default:
        console.warn(`⚠️ Unknown entity type: ${action.entity}`);
    }
  }

  private async syncTask(action: OfflineAction): Promise<void> {
    // Simulate task sync
    await this.simulateApiCall();
    console.log(`📝 Task ${action.type}: ${action.data.title || action.data.id}`);
  }

  private async syncEvent(action: OfflineAction): Promise<void> {
    // Simulate event sync
    await this.simulateApiCall();
    console.log(`📅 Event ${action.type}: ${action.data.title || action.data.id}`);
  }

  private async syncGoal(action: OfflineAction): Promise<void> {
    // Simulate goal sync
    await this.simulateApiCall();
    console.log(`🎯 Goal ${action.type}: ${action.data.title || action.data.id}`);
  }

  private async syncSetting(action: OfflineAction): Promise<void> {
    // Simulate setting sync
    await this.simulateApiCall();
    console.log(`⚙️ Setting ${action.type}: ${action.data.key || 'unknown'}`);
  }

  // Simulate API call delay
  private async simulateApiCall(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 100 + Math.random() * 200); // 100-300ms delay
    });
  }

  // Force sync (manual trigger)
  async forcSync(): Promise<void> {
    if (!networkService.isNetworkAvailable()) {
      console.warn('⚠️ Cannot force sync - network unavailable');
      return;
    }

    console.log('🔄 Force sync triggered');
    await this.startSync();
  }

  // Check if sync is in progress
  public isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  // Get sync status
  public getSyncStatus(): { isSyncing: boolean; isOnline: boolean; pendingCount: number } {
    return {
      isSyncing: this.isSyncing,
      isOnline: networkService.isNetworkAvailable(),
      pendingCount: 0 // Will be updated by caller
    };
  }

  // Add action to sync queue
  async addToSyncQueue(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: 'task' | 'event' | 'goal' | 'setting',
    data: any
  ): Promise<void> {
    await offlineStorageService.queueOfflineAction({
      type,
      entity,
      data
    });

    // Try to sync immediately if online
    if (networkService.isNetworkAvailable() && !this.syncInProgress) {
      setTimeout(() => this.startSync(), 1000); // Small delay to batch actions
    }
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;