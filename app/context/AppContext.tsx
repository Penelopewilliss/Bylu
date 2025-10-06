// AppContext.tsx
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Task, CalendarEvent, MoodEntry, FocusSession, Badge, BrainDumpEntry, HyperfocusLog, WeeklyReflection, Goal, MicroTask } from '../types';

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
	const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);
	const [focusStreak, setFocusStreak] = useState<number>(0);
	const [tinyWins, setTinyWins] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		loadData();
	}, []);

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
		focusStreak,
		tinyWins,
		isLoading,
		isOnboardingCompleted,
		completeOnboarding,
		addTask,
		toggleTask,
		deleteTask,
		addEvent,
		deleteEvent,
		addGoal,
		updateGoal,
		deleteGoal,
		toggleGoalMicroTask,
	}), [tasks, events, goals, moods, focusSessions, badges, brainDump, hyperfocusLogs, reflections, focusStreak, tinyWins, isLoading, isOnboardingCompleted, completeOnboarding, addTask, toggleTask, deleteTask, addEvent, deleteEvent, addGoal, updateGoal, deleteGoal, toggleGoalMicroTask]);
});
