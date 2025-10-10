// AppContext.tsx
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Task, CalendarEvent, MoodEntry, FocusSession, Badge, BrainDumpEntry, HyperfocusLog, WeeklyReflection, Goal, MicroTask, Alarm } from '../types';
import { AlarmNotificationService, setupNotificationCategories } from '../services/AlarmNotificationService';

const STORAGE_KEYS = {
	TASKS: '@planner_tasks',
	EVENTS: '@planner_events',
	GOALS: '@planner_goals',
	MOODS: '@planner_moods',
	FOCUS_SESSIONS: '@planner_focus_sessions',
	BADGES: '@planner_badges',
	BRAIN_DUMP: '@planner_brain_dump',
	HYPERFOCUS_LOGS: '@planner_hyperfocus_logs',
	REFLECTIONS: '@planner_reflections',
	FOCUS_STREAK: '@planner_focus_streak',
	TINY_WINS: '@planner_tiny_wins',
	ONBOARDING_COMPLETED: '@planner_onboarding_completed',
	ALARMS: '@planner_alarms',
};

export const [AppProvider, useApp] = createContextHook(() => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [moods, setMoods] = useState<MoodEntry[]>([]);
	const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
	const [badges, setBadges] = useState<Badge[]>([]);
	const [brainDump, setBrainDump] = useState<BrainDumpEntry[]>([]);
	const [hyperfocusLogs, setHyperfocusLogs] = useState<HyperfocusLog[]>([]);
	const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
	const [alarms, setAlarms] = useState<Alarm[]>([]);
	const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);
	const [focusStreak, setFocusStreak] = useState<number>(0);
	const [tinyWins, setTinyWins] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		loadData();
		initializeNotifications();
	}, []);

	const initializeNotifications = async () => {
		try {
			await AlarmNotificationService.requestPermissions();
			await setupNotificationCategories();
		} catch (error) {
			console.error('Error initializing notifications:', error);
		}
	};

	const loadData = async () => {
		try {
		const [
			storedTasks,
			storedEvents,
			storedGoals,
			storedMoods,
			storedFocusSessions,
			storedBadges,
			storedBrainDump,
			storedHyperfocusLogs,
			storedReflections,
			storedAlarms,
			storedFocusStreak,
			storedTinyWins,
			storedOnboardingCompleted,
		] = await Promise.all([
			AsyncStorage.getItem(STORAGE_KEYS.TASKS),
			AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
			AsyncStorage.getItem(STORAGE_KEYS.GOALS),
			AsyncStorage.getItem(STORAGE_KEYS.MOODS),
			AsyncStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS),
			AsyncStorage.getItem(STORAGE_KEYS.BADGES),
			AsyncStorage.getItem(STORAGE_KEYS.BRAIN_DUMP),
			AsyncStorage.getItem(STORAGE_KEYS.HYPERFOCUS_LOGS),
			AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS),
			AsyncStorage.getItem(STORAGE_KEYS.ALARMS),
			AsyncStorage.getItem(STORAGE_KEYS.FOCUS_STREAK),
			AsyncStorage.getItem(STORAGE_KEYS.TINY_WINS),
			AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
		]);

		if (storedTasks) setTasks(JSON.parse(storedTasks));
			if (storedEvents) setEvents(JSON.parse(storedEvents));
			if (storedGoals) {
				setGoals(JSON.parse(storedGoals));
			} else {
				// Set default goals if none exist
				const defaultGoals: Goal[] = [
					{
						id: '1',
						title: 'Launch Dream Business',
						microTasks: [
							{ id: 't1', text: 'Complete business plan', completed: true },
							{ id: 't2', text: 'Research target market', completed: true },
							{ id: 't3', text: 'Secure initial funding', completed: false },
							{ id: 't4', text: 'Build MVP prototype', completed: false },
							{ id: 't5', text: 'Test with 10 customers', completed: false },
						],
						resources: 'Business mentor, funding ($10k), web developer, marketing budget',
						notes: 'Focus on solving a real problem. Start small and iterate quickly.',
						createdAt: new Date().toISOString(),
					},
					{
						id: '2',
						title: 'Get Fit & Healthy',
						microTasks: [
							{ id: 't6', text: 'Join a gym', completed: true },
							{ id: 't7', text: 'Work out 3x per week', completed: false },
							{ id: 't8', text: 'Meal prep on Sundays', completed: false },
							{ id: 't9', text: 'Drink 8 glasses water daily', completed: false },
						],
						resources: 'Gym membership, meal prep containers, fitness tracker',
						notes: 'Consistency over perfection. Start with 20-minute workouts.',
						createdAt: new Date().toISOString(),
					},
				];
				setGoals(defaultGoals);
				await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(defaultGoals));
			}
			if (storedMoods) setMoods(JSON.parse(storedMoods));
			if (storedFocusSessions) setFocusSessions(JSON.parse(storedFocusSessions));
			if (storedBadges) setBadges(JSON.parse(storedBadges));
			if (storedBrainDump) setBrainDump(JSON.parse(storedBrainDump));
			if (storedHyperfocusLogs) setHyperfocusLogs(JSON.parse(storedHyperfocusLogs));
			if (storedReflections) setReflections(JSON.parse(storedReflections));
			if (storedAlarms) {
				const alarms = JSON.parse(storedAlarms);
				setAlarms(alarms);
				
				// Schedule notifications for enabled alarms
				for (const alarm of alarms) {
					if (alarm.isEnabled) {
						await AlarmNotificationService.scheduleAlarm(alarm);
					}
				}
			}
			if (storedFocusStreak) setFocusStreak(JSON.parse(storedFocusStreak));
			if (storedTinyWins) setTinyWins(JSON.parse(storedTinyWins));
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const saveTasks = async (newTasks: Task[]) => {
		setTasks(newTasks);
		await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
	};

	const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
		const newTask: Task = {
			...task,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
			completed: false,
		};
		const updatedTasks = [...tasks, newTask];
		await saveTasks(updatedTasks);
		return newTask;
	}, [tasks]);

	const toggleTask = useCallback(async (taskId: string) => {
		const updatedTasks = tasks.map(task => 
			task.id === taskId ? { ...task, completed: !task.completed } : task
		);
		await saveTasks(updatedTasks);
	}, [tasks]);

	const deleteTask = useCallback(async (taskId: string) => {
		const updatedTasks = tasks.filter(task => task.id !== taskId);
		await saveTasks(updatedTasks);
	}, [tasks]);

	// Event management functions
	const saveEvents = async (newEvents: CalendarEvent[]) => {
		setEvents(newEvents);
		await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(newEvents));
	};

	const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
		const newEvent: CalendarEvent = {
			...event,
			id: Date.now().toString(),
		};
		const updatedEvents = [...events, newEvent];
		await saveEvents(updatedEvents);
		return newEvent;
	}, [events]);

	const deleteEvent = useCallback(async (eventId: string) => {
		const updatedEvents = events.filter(event => event.id !== eventId);
		await saveEvents(updatedEvents);
	}, [events]);

	const updateEvent = useCallback(async (eventId: string, updatedEvent: Partial<CalendarEvent>) => {
		const updatedEvents = events.map(event => 
			event.id === eventId ? { ...event, ...updatedEvent } : event
		);
		await saveEvents(updatedEvents);
	}, [events]);

	// Goal management functions
	const saveGoals = async (newGoals: Goal[]) => {
		setGoals(newGoals);
		await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
	};

	const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
		const newGoal: Goal = {
			...goal,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const updatedGoals = [...goals, newGoal];
		await saveGoals(updatedGoals);
		return newGoal;
	}, [goals]);

	const updateGoal = useCallback(async (goalId: string, updatedGoal: Partial<Goal>) => {
		const updatedGoals = goals.map(goal => 
			goal.id === goalId ? { ...goal, ...updatedGoal } : goal
		);
		await saveGoals(updatedGoals);
	}, [goals]);

	const deleteGoal = useCallback(async (goalId: string) => {
		const updatedGoals = goals.filter(goal => goal.id !== goalId);
		await saveGoals(updatedGoals);
	}, [goals]);

	const toggleGoalMicroTask = useCallback(async (goalId: string, taskId: string) => {
		const updatedGoals = goals.map(goal =>
			goal.id === goalId
				? {
						...goal,
						microTasks: goal.microTasks.map(task =>
							task.id === taskId
								? { ...task, completed: !task.completed }
								: task
						)
					}
				: goal
		);
		await saveGoals(updatedGoals);
	}, [goals]);

	// Brain Dump functions
	const addBrainDumpEntry = useCallback(async (content: string, additionalData?: Partial<BrainDumpEntry>) => {
		const newEntry: BrainDumpEntry = {
			id: Date.now().toString(),
			content,
			createdAt: new Date().toISOString(),
			...additionalData,
		};
		const updatedBrainDump = [...brainDump, newEntry];
		setBrainDump(updatedBrainDump);
		await AsyncStorage.setItem(STORAGE_KEYS.BRAIN_DUMP, JSON.stringify(updatedBrainDump));
	}, [brainDump]);

	const deleteBrainDumpEntry = useCallback(async (entryId: string) => {
		console.log('Deleting brain dump entry:', entryId);
		console.log('Current brain dump entries:', brainDump.length);
		const updatedBrainDump = brainDump.filter(entry => entry.id !== entryId);
		console.log('Updated brain dump entries:', updatedBrainDump.length);
		setBrainDump(updatedBrainDump);
		await AsyncStorage.setItem(STORAGE_KEYS.BRAIN_DUMP, JSON.stringify(updatedBrainDump));
	}, [brainDump]);

	// Alarm functions
	const addAlarm = useCallback(async (alarmData: Omit<Alarm, 'id' | 'createdAt'>) => {
		const newAlarm: Alarm = {
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
			...alarmData,
		};
		const updatedAlarms = [...alarms, newAlarm];
		setAlarms(updatedAlarms);
		await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
		
		// Schedule notification if alarm is enabled
		if (newAlarm.isEnabled) {
			await AlarmNotificationService.scheduleAlarm(newAlarm);
		}
	}, [alarms]);

	const updateAlarm = useCallback(async (alarmId: string, updates: Partial<Alarm>) => {
		const updatedAlarms = alarms.map(alarm => 
			alarm.id === alarmId ? { ...alarm, ...updates } : alarm
		);
		setAlarms(updatedAlarms);
		await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
		
		// Reschedule the alarm with new settings
		const updatedAlarm = updatedAlarms.find(alarm => alarm.id === alarmId);
		if (updatedAlarm) {
			await AlarmNotificationService.rescheduleAlarm(updatedAlarm);
		}
	}, [alarms]);

	const deleteAlarm = useCallback(async (alarmId: string) => {
		try {
			const alarmToDelete = alarms.find(alarm => alarm.id === alarmId);
			const updatedAlarms = alarms.filter(alarm => alarm.id !== alarmId);
			setAlarms(updatedAlarms);
			await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
			
			// Cancel scheduled notifications
			if (alarmToDelete) {
				try {
					await AlarmNotificationService.cancelAlarm(alarmId, alarmToDelete.repeatDays || []);
				} catch (notificationError) {
					console.error('Error cancelling notifications:', notificationError);
					// Don't let notification errors prevent deletion
				}
			}
		} catch (error) {
			console.error('Error deleting alarm:', error);
		}
	}, [alarms]);

	const toggleAlarm = useCallback(async (alarmId: string) => {
		const updatedAlarms = alarms.map(alarm => 
			alarm.id === alarmId ? { ...alarm, isEnabled: !alarm.isEnabled } : alarm
		);
		setAlarms(updatedAlarms);
		await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(updatedAlarms));
		
		// Reschedule or cancel based on new enabled state
		const toggledAlarm = updatedAlarms.find(alarm => alarm.id === alarmId);
		if (toggledAlarm) {
			await AlarmNotificationService.rescheduleAlarm(toggledAlarm);
		}
	}, [alarms]);

	const completeOnboarding = useCallback(async () => {
		setIsOnboardingCompleted(true);
		await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(true));
	}, []);

	return useMemo(() => ({
		tasks,
		events,
		goals,
		moods,
		focusSessions,
		badges,
		brainDump,
		hyperfocusLogs,
		reflections,
		alarms,
		focusStreak,
		tinyWins,
		isLoading,
		isOnboardingCompleted,
		completeOnboarding,
		addTask,
		toggleTask,
		deleteTask,
		addEvent,
		updateEvent,
		deleteEvent,
		addGoal,
		updateGoal,
		deleteGoal,
		toggleGoalMicroTask,
		addBrainDumpEntry,
		deleteBrainDumpEntry,
		addAlarm,
		updateAlarm,
		deleteAlarm,
		toggleAlarm,
	}), [tasks, events, goals, moods, focusSessions, badges, brainDump, hyperfocusLogs, reflections, alarms, focusStreak, tinyWins, isLoading, isOnboardingCompleted, completeOnboarding, addTask, toggleTask, deleteTask, addEvent, updateEvent, deleteEvent, addGoal, updateGoal, deleteGoal, toggleGoalMicroTask, addBrainDumpEntry, deleteBrainDumpEntry, addAlarm, updateAlarm, deleteAlarm, toggleAlarm]);
});
