import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export class FirestoreService {
  /**
   * Save user's alarms to Firestore
   */
  static async saveAlarms(userId: string, alarms: any[]): Promise<void> {
    try {
      const alarmsRef = doc(db, 'users', userId, 'data', 'alarms');
      await setDoc(alarmsRef, {
        alarms: alarms,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Alarms synced to cloud');
    } catch (error) {
      console.error('❌ Error saving alarms:', error);
      throw new Error('Failed to sync alarms to cloud');
    }
  }

  /**
   * Get user's alarms from Firestore
   */
  static async getAlarms(userId: string): Promise<any[]> {
    try {
      const alarmsRef = doc(db, 'users', userId, 'data', 'alarms');
      const alarmsSnap = await getDoc(alarmsRef);
      
      if (alarmsSnap.exists()) {
        return alarmsSnap.data().alarms || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting alarms:', error);
      return [];
    }
  }

  /**
   * Save user's tasks to Firestore
   */
  static async saveTasks(userId: string, tasks: any[]): Promise<void> {
    try {
      const tasksRef = doc(db, 'users', userId, 'data', 'tasks');
      await setDoc(tasksRef, {
        tasks: tasks,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Tasks synced to cloud');
    } catch (error) {
      console.error('❌ Error saving tasks:', error);
      throw new Error('Failed to sync tasks to cloud');
    }
  }

  /**
   * Get user's tasks from Firestore
   */
  static async getTasks(userId: string): Promise<any[]> {
    try {
      const tasksRef = doc(db, 'users', userId, 'data', 'tasks');
      const tasksSnap = await getDoc(tasksRef);
      
      if (tasksSnap.exists()) {
        return tasksSnap.data().tasks || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting tasks:', error);
      return [];
    }
  }

  /**
   * Save user's goals to Firestore
   */
  static async saveGoals(userId: string, goals: any[]): Promise<void> {
    try {
      const goalsRef = doc(db, 'users', userId, 'data', 'goals');
      await setDoc(goalsRef, {
        goals: goals,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Goals synced to cloud');
    } catch (error) {
      console.error('❌ Error saving goals:', error);
      throw new Error('Failed to sync goals to cloud');
    }
  }

  /**
   * Get user's goals from Firestore
   */
  static async getGoals(userId: string): Promise<any[]> {
    try {
      const goalsRef = doc(db, 'users', userId, 'data', 'goals');
      const goalsSnap = await getDoc(goalsRef);
      
      if (goalsSnap.exists()) {
        return goalsSnap.data().goals || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting goals:', error);
      return [];
    }
  }

  /**
   * Save user's brain dump entries to Firestore
   */
  static async saveBrainDump(userId: string, entries: any[]): Promise<void> {
    try {
      const brainDumpRef = doc(db, 'users', userId, 'data', 'brainDump');
      await setDoc(brainDumpRef, {
        entries: entries,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Brain dump synced to cloud');
    } catch (error) {
      console.error('❌ Error saving brain dump:', error);
      throw new Error('Failed to sync brain dump to cloud');
    }
  }

  /**
   * Get user's brain dump entries from Firestore
   */
  static async getBrainDump(userId: string): Promise<any[]> {
    try {
      const brainDumpRef = doc(db, 'users', userId, 'data', 'brainDump');
      const brainDumpSnap = await getDoc(brainDumpRef);
      
      if (brainDumpSnap.exists()) {
        return brainDumpSnap.data().entries || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting brain dump:', error);
      return [];
    }
  }

  /**
   * Save user settings to Firestore
   */
  static async saveSettings(userId: string, settings: any): Promise<void> {
    try {
      const settingsRef = doc(db, 'users', userId, 'data', 'settings');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Settings synced to cloud');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      throw new Error('Failed to sync settings to cloud');
    }
  }

  /**
   * Get user settings from Firestore
   */
  static async getSettings(userId: string): Promise<any> {
    try {
      const settingsRef = doc(db, 'users', userId, 'data', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        return settingsSnap.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      return null;
    }
  }

  /**
   * Sync all user data to Firestore
   */
  static async syncAllData(userId: string, data: {
    alarms?: any[];
    tasks?: any[];
    goals?: any[];
    brainDump?: any[];
    settings?: any;
  }): Promise<void> {
    const promises: Promise<void>[] = [];

    if (data.alarms) promises.push(this.saveAlarms(userId, data.alarms));
    if (data.tasks) promises.push(this.saveTasks(userId, data.tasks));
    if (data.goals) promises.push(this.saveGoals(userId, data.goals));
    if (data.brainDump) promises.push(this.saveBrainDump(userId, data.brainDump));
    if (data.settings) promises.push(this.saveSettings(userId, data.settings));

    await Promise.all(promises);
    console.log('✅ All data synced to cloud');
  }

  /**
   * Get all user data from Firestore
   */
  static async getAllData(userId: string): Promise<{
    alarms: any[];
    tasks: any[];
    goals: any[];
    brainDump: any[];
    settings: any;
  }> {
    const [alarms, tasks, goals, brainDump, settings] = await Promise.all([
      this.getAlarms(userId),
      this.getTasks(userId),
      this.getGoals(userId),
      this.getBrainDump(userId),
      this.getSettings(userId)
    ]);

    return { alarms, tasks, goals, brainDump, settings };
  }
}
