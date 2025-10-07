import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NotificationSettings {
  enabled: boolean;
  timings: number[]; // minutes before appointment
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PriorityReminderSettings {
  enabled: boolean;
  morningEnabled: boolean;
  lunchEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: { hour: number; minute: number };
  lunchTime: { hour: number; minute: number };
  eveningTime: { hour: number; minute: number };
}

export interface Appointment {
  id: string;
  title: string;
  datetime: Date;
  description?: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  timings: [15, 60], // 15 minutes and 1 hour before
  soundEnabled: true,
  vibrationEnabled: true,
};

const DEFAULT_PRIORITY_REMINDER_SETTINGS: PriorityReminderSettings = {
  enabled: true,
  morningEnabled: true,
  lunchEnabled: false,
  eveningEnabled: false,
  morningTime: { hour: 9, minute: 0 },
  lunchTime: { hour: 13, minute: 0 },
  eveningTime: { hour: 18, minute: 0 },
};

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private priorityReminderSettings: PriorityReminderSettings = DEFAULT_PRIORITY_REMINDER_SETTINGS;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Load settings
    await this.loadSettings();
    
    // Initialize priority reminders
    await this.scheduleDailyPriorityReminders();
    
    console.log('🔔 Notification service initialized');
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointment Reminders',
        description: 'Notifications for upcoming appointments',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF69B4',
        sound: 'default', // We can customize this later
      });
    }

    return finalStatus === 'granted';
  }

  async getSettings(): Promise<NotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  async updatePriorityReminderSettings(newSettings: Partial<PriorityReminderSettings>): Promise<void> {
    this.priorityReminderSettings = { ...this.priorityReminderSettings, ...newSettings };
    await AsyncStorage.setItem('priorityReminderSettings', JSON.stringify(this.priorityReminderSettings));
    
    // Reschedule reminders when settings change
    await this.scheduleDailyPriorityReminders();
  }

  getPriorityReminderSettings(): PriorityReminderSettings {
    return { ...this.priorityReminderSettings };
  }

  async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      
      // Load priority reminder settings
      const priorityStored = await AsyncStorage.getItem('priorityReminderSettings');
      if (priorityStored) {
        this.priorityReminderSettings = { ...DEFAULT_PRIORITY_REMINDER_SETTINGS, ...JSON.parse(priorityStored) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      this.settings = DEFAULT_SETTINGS;
      this.priorityReminderSettings = DEFAULT_PRIORITY_REMINDER_SETTINGS;
    }
  }

  async scheduleAppointmentNotifications(appointment: Appointment, customTimings?: number[]): Promise<string[]> {
    if (!this.settings.enabled) {
      return [];
    }

    const notificationIds: string[] = [];
    const appointmentTime = new Date(appointment.datetime).getTime();
    const now = Date.now();

    // Use custom timings if provided, otherwise use global settings
    const timingsToUse = customTimings || this.settings.timings;

    for (const timing of timingsToUse) {
      const notificationTime = appointmentTime - (timing * 60 * 1000);
      
      // Only schedule if notification time is in the future
      if (notificationTime > now) {
        try {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🌸 Appointment Reminder',
              body: `${appointment.title} ${timing === 60 ? 'in 1 hour' : `in ${timing} minutes`}`,
              data: {
                appointmentId: appointment.id,
                type: 'appointment_reminder',
                timing: timing,
              },
              sound: this.settings.soundEnabled ? 'default' : false,
              ...(Platform.OS === 'android' && {
                channelId: 'appointments',
              }),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(notificationTime),
            },
          });

          notificationIds.push(notificationId);
          console.log(`✅ Scheduled notification for ${appointment.title} - ${timing} minutes before`);
        } catch (error) {
          console.error('Failed to schedule notification:', error);
        }
      }
    }

    // Store notification IDs for this appointment
    await this.storeAppointmentNotifications(appointment.id, notificationIds);
    
    return notificationIds;
  }

  async cancelAppointmentNotifications(appointmentId: string): Promise<void> {
    try {
      const notificationIds = await this.getAppointmentNotifications(appointmentId);
      
      if (notificationIds.length > 0) {
        for (const notificationId of notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        }
        console.log(`🗑️ Cancelled ${notificationIds.length} notifications for appointment ${appointmentId}`);
      }

      // Remove from storage
      await this.removeAppointmentNotifications(appointmentId);
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  async rescheduleAppointmentNotifications(appointment: Appointment): Promise<void> {
    // Cancel existing notifications
    await this.cancelAppointmentNotifications(appointment.id);
    
    // Schedule new notifications
    await this.scheduleAppointmentNotifications(appointment);
  }

  private async storeAppointmentNotifications(appointmentId: string, notificationIds: string[]): Promise<void> {
    try {
      const key = `notifications_${appointmentId}`;
      await AsyncStorage.setItem(key, JSON.stringify(notificationIds));
    } catch (error) {
      console.error('Failed to store notification IDs:', error);
    }
  }

  private async getAppointmentNotifications(appointmentId: string): Promise<string[]> {
    try {
      const key = `notifications_${appointmentId}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notification IDs:', error);
      return [];
    }
  }

  private async removeAppointmentNotifications(appointmentId: string): Promise<void> {
    try {
      const key = `notifications_${appointmentId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove notification IDs:', error);
    }
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async testNotification(): Promise<void> {
    if (!this.settings.enabled) {
      console.log('❌ Notifications are disabled');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌸 Test Notification',
          body: 'This is a test notification from Glowgetter! 🌸',
          data: { type: 'test' },
          sound: this.settings.soundEnabled ? 'default' : false,
          ...(Platform.OS === 'android' && {
            channelId: 'appointments',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
      console.log('✅ Test notification scheduled');
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
    }
  }

  async testPriorityReminder(): Promise<void> {
    if (!this.settings.enabled) {
      console.log('❌ Notifications are disabled');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Priority Task Reminder',
          body: 'Time to focus on your high priority tasks! ⚡',
          data: { 
            type: 'priority-reminder-test',
            timeSlot: 'test'
          },
          sound: this.settings.soundEnabled ? 'default' : false,
          ...(Platform.OS === 'android' && {
            channelId: 'priority-reminders',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
      console.log('✅ Test priority reminder scheduled');
    } catch (error) {
      console.error('Failed to schedule test priority reminder:', error);
    }
  }

  async scheduleDailyPriorityReminders(): Promise<void> {
    if (!this.priorityReminderSettings.enabled) {
      await this.cancelAllPriorityReminders();
      return;
    }

    // Cancel existing priority reminders
    await this.cancelAllPriorityReminders();

    const reminderTimes = [];
    
    if (this.priorityReminderSettings.morningEnabled) {
      reminderTimes.push({
        ...this.priorityReminderSettings.morningTime,
        id: 'priority-morning',
        label: 'Morning'
      });
    }
    
    if (this.priorityReminderSettings.lunchEnabled) {
      reminderTimes.push({
        ...this.priorityReminderSettings.lunchTime,
        id: 'priority-lunch',
        label: 'Lunch'
      });
    }
    
    if (this.priorityReminderSettings.eveningEnabled) {
      reminderTimes.push({
        ...this.priorityReminderSettings.eveningTime,
        id: 'priority-evening',
        label: 'Evening'
      });
    }

    // Schedule reminders for each enabled time
    for (const time of reminderTimes) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚡ ${time.label} Priority Check`,
            body: 'Time to review your priority tasks! ⚡',
            data: { 
              type: 'priority-reminder',
              timeSlot: time.id
            },
            sound: this.settings.soundEnabled ? 'default' : false,
            ...(Platform.OS === 'android' && {
              channelId: 'priority-reminders',
            }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
          },
          identifier: time.id,
        });
        
        console.log(`✅ Scheduled ${time.label.toLowerCase()} priority reminder for ${time.hour}:${time.minute.toString().padStart(2, '0')}`);
      } catch (error) {
        console.error(`Failed to schedule ${time.label.toLowerCase()} priority reminder:`, error);
      }
    }
  }

  async cancelAllPriorityReminders(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync('priority-morning');
      await Notifications.cancelScheduledNotificationAsync('priority-lunch');
      await Notifications.cancelScheduledNotificationAsync('priority-evening');
      console.log('✅ Cancelled all priority reminders');
    } catch (error) {
      console.error('Failed to cancel priority reminders:', error);
    }
  }
}

export default NotificationService;