export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'household' | 'groceries' | 'calls' | 'shopping' | 'errands' | 'finances' | 'fitness' | 'hobbies' | 'other';
export type MoodType = 'energized' | 'happy' | 'calm' | 'tired' | 'stressed';

export interface MicroStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface MicroTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  microTasks: MicroTask[];
  resources: string;
  notes: string;
  createdAt: string;
}



export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  estimatedTime?: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  microSteps: MicroStep[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  color: string;
  category: Category;
  // Google Calendar sync fields
  googleId?: string;
  lastSyncTime?: string;
  source?: 'local' | 'google';
  localOnly?: boolean;
  isAllDay?: boolean;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  energy: number;
  notes?: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  taskId?: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface BrainDumpEntry {
  id: string;
  content: string;
  createdAt: string;
  type?: 'text' | 'voice';
  audioUri?: string;
  duration?: number;
}

export interface HyperfocusLog {
  id: string;
  activity: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
}

export interface WeeklyReflection {
  id: string;
  weekStart: string;
  weekEnd: string;
  wins: string[];
  challenges: string[];
  distractions: string[];
  nextWeekGoals: string[];
}

export interface Alarm {
  id: string;
  time: string; // Format: "HH:MM" (24-hour)
  label: string;
  isEnabled: boolean;
  repeatDays: number[]; // 0-6 (Sunday-Saturday)
  soundName: string;
  vibrate: boolean;
  snoozeEnabled: boolean;
  snoozeInterval: number; // minutes
  createdAt: string;
}

export type AlarmSoundType = 'gentle_chimes' | 'soft_piano' | 'nature_sounds' | 'classic_bell' | 'peaceful_melody';
