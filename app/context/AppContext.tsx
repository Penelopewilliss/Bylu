import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Task, CalendarEvent } from '../types';

interface AppContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Morning meditation',
      description: 'Start the day with mindfulness',
      category: 'health',
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString(),
      microSteps: []
    },
    {
      id: '2',
      title: 'Complete project proposal',
      description: 'Finish the wellness app proposal',
      category: 'work',
      priority: 'high',
      completed: true,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      microSteps: []
    }
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([
    // Sample events for testing
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync meeting',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
      color: '#E8B4C4',
      category: 'work'
    },
    {
      id: '2',
      title: 'Yoga Class',
      description: 'Morning yoga session',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 1.5 hours
      color: '#B4E8D1',
      category: 'health'
    }
  ]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined
          }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...eventData } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  return (
    <AppContext.Provider value={{
      tasks,
      addTask,
      toggleTask,
      deleteTask,
      events,
      addEvent,
      updateEvent,
      deleteEvent
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
