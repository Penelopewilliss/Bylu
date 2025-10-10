import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Alarm } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class AlarmNotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // For Android, we need to create a notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarms', {
          name: 'Alarms',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF69B4',
          sound: 'default',
        });
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleAlarm(alarm: Alarm): Promise<string[]> {
    try {
      const notificationIds: string[] = [];
      const [hour, minute] = alarm.time.split(':').map(Number);

      if (alarm.repeatDays.length === 0) {
        // One-time alarm
        const notificationId = await this.scheduleOneTimeAlarm(alarm, hour, minute);
        if (notificationId) {
          notificationIds.push(notificationId);
        }
      } else {
        // Recurring alarm
        for (const dayOfWeek of alarm.repeatDays) {
          const notificationId = await this.scheduleRecurringAlarm(alarm, hour, minute, dayOfWeek);
          if (notificationId) {
            notificationIds.push(notificationId);
          }
        }
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      return [];
    }
  }

  private static async scheduleOneTimeAlarm(alarm: Alarm, hour: number, minute: number): Promise<string | null> {
    try {
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(hour, minute, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: alarm.label || 'Time to wake up!',
          sound: this.getSoundFile(alarm.soundName),
          vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'alarm',
          data: {
            type: 'alarm',
            alarmId: alarm.id,
            alarmLabel: alarm.label,
            soundName: alarm.soundName,
            time: alarm.time,
          },
        },
        trigger: {
          type: 'date',
          date: alarmTime,
        } as Notifications.DateTriggerInput,
        identifier: `alarm-${alarm.id}-onetime`,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling one-time alarm:', error);
      return null;
    }
  }

  private static async scheduleRecurringAlarm(alarm: Alarm, hour: number, minute: number, dayOfWeek: number): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: alarm.label || 'Time to wake up!',
          sound: this.getSoundFile(alarm.soundName),
          vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'alarm',
          data: {
            type: 'alarm',
            alarmId: alarm.id,
            alarmLabel: alarm.label,
            soundName: alarm.soundName,
            time: alarm.time,
          },
        },
        trigger: {
          type: 'calendar',
          weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday=1), we use 0-6 (Sunday=0)
          hour,
          minute,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
        identifier: `alarm-${alarm.id}-day-${dayOfWeek}`,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling recurring alarm:', error);
      return null;
    }
  }

  static async cancelAlarm(alarmId: string, repeatDays: number[]): Promise<void> {
    try {
      const identifiersToCancel: string[] = [];

      if (repeatDays.length === 0) {
        // One-time alarm
        identifiersToCancel.push(`alarm-${alarmId}-onetime`);
      } else {
        // Recurring alarm
        for (const dayOfWeek of repeatDays) {
          identifiersToCancel.push(`alarm-${alarmId}-day-${dayOfWeek}`);
        }
      }

      for (const identifier of identifiersToCancel) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }
    } catch (error) {
      console.error('Error canceling alarm:', error);
    }
  }

  static async cancelAllAlarms(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all alarms:', error);
    }
  }

  private static getSoundFile(soundName: string): string {
    // Map sound names to actual sound files
    // For now, we'll use the default sound since custom sounds require additional setup
    const soundMap: { [key: string]: string } = {
      gentle_chimes: 'default',
      soft_piano: 'default',
      nature_sounds: 'default',
      classic_bell: 'default',
      peaceful_melody: 'default',
      morning_breeze: 'default',
      ocean_waves: 'default',
      forest_birds: 'default',
      wind_chimes: 'default',
      rainfall: 'default',
    };

    return soundMap[soundName] || 'default';
  }

  static async getScheduledAlarms(): Promise<Notifications.NotificationRequest[]> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.filter(notification => 
        notification.identifier.startsWith('alarm-')
      );
    } catch (error) {
      console.error('Error getting scheduled alarms:', error);
      return [];
    }
  }

  static async rescheduleAlarm(alarm: Alarm): Promise<void> {
    try {
      // Cancel existing notifications for this alarm
      await this.cancelAlarm(alarm.id, alarm.repeatDays);
      
      // Reschedule if alarm is enabled
      if (alarm.isEnabled) {
        await this.scheduleAlarm(alarm);
      }
    } catch (error) {
      console.error('Error rescheduling alarm:', error);
    }
  }
}

// Setup notification categories and actions
export const setupNotificationCategories = async () => {
  try {
    await Notifications.setNotificationCategoryAsync('alarm', [
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
  } catch (error) {
    console.error('Error setting up notification categories:', error);
  }
};