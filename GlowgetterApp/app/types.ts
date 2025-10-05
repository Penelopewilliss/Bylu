export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'other';
export type MoodType = 'energized' | 'happy' | 'calm' | 'tired' | 'stressed';
export type GoalCategory = 'personal' | 'career' | 'health' | 'finance';

export interface MicroStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string;
  completed: boolean;
  createdAt: string;
}

export interface Strategy {
  id: string;
  goalId: string;
  step: string;
  completed: boolean;
}

// New Workflow Types
export interface WorkflowSubtask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  subtasks: WorkflowSubtask[];
  createdAt: string;
}

export interface WorkflowRequirement {
  id: string;
  title: string;
  type: 'money' | 'time' | 'knowledge' | 'equipment' | 'skill' | 'document' | 'other';
  description?: string;
  icon?: string;
  completed: boolean;
}

export interface WorkflowContact {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
}

export interface WorkflowResource {
  id: string;
  title: string;
  type: 'contact' | 'website' | 'document' | 'note';
  value: string; // email, phone, URL, or file path
  description?: string;
}

export interface WorkflowProgress {
  id: string;
  date: string;
  note: string;
  type: 'milestone' | 'reflection' | 'obstacle' | 'insight';
}

export interface WorkflowGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  steps: WorkflowStep[];
  requirements: WorkflowRequirement[];
  contacts: WorkflowContact[];
  resources: WorkflowResource[];
  progressNotes: WorkflowProgress[];
  targetDate: string;
  completed: boolean;
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
