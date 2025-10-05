// AppContext.tsx
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Task, CalendarEvent, MoodEntry, FocusSession, Badge, BrainDumpEntry, HyperfocusLog, WeeklyReflection } from '../types';

const STORAGE_KEYS = {
	TASKS: '@planner_tasks',
	EVENTS: '@planner_events',
	MOODS: '@planner_moods',
	FOCUS_SESSIONS: '@planner_focus_sessions',
	BADGES: '@planner_badges',
	BRAIN_DUMP: '@planner_brain_dump',
	HYPERFOCUS_LOGS: '@planner_hyperfocus_logs',
	REFLECTIONS: '@planner_reflections',
	FOCUS_STREAK: '@planner_focus_streak',
	TINY_WINS: '@planner_tiny_wins',
};

export const [AppProvider, useApp] = createContextHook(() => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [moods, setMoods] = useState<MoodEntry[]>([]);
	const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
	const [badges, setBadges] = useState<Badge[]>([]);
	const [brainDump, setBrainDump] = useState<BrainDumpEntry[]>([]);
	const [hyperfocusLogs, setHyperfocusLogs] = useState<HyperfocusLog[]>([]);
	const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
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
				storedMoods,
				storedFocusSessions,
				storedBadges,
				storedBrainDump,
				storedHyperfocusLogs,
				storedReflections,
				storedFocusStreak,
				storedTinyWins,
			] = await Promise.all([
				AsyncStorage.getItem(STORAGE_KEYS.TASKS),
				AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
				AsyncStorage.getItem(STORAGE_KEYS.MOODS),
				AsyncStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS),
				AsyncStorage.getItem(STORAGE_KEYS.BADGES),
				AsyncStorage.getItem(STORAGE_KEYS.BRAIN_DUMP),
				AsyncStorage.getItem(STORAGE_KEYS.HYPERFOCUS_LOGS),
				AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS),
				AsyncStorage.getItem(STORAGE_KEYS.FOCUS_STREAK),
				AsyncStorage.getItem(STORAGE_KEYS.TINY_WINS),
			]);

			if (storedTasks) setTasks(JSON.parse(storedTasks));
			if (storedEvents) setEvents(JSON.parse(storedEvents));
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
			microSteps: [],
		};
		await saveTasks([...tasks, newTask]);
	}, [tasks]);

	// Je kunt hier alle andere save/update functies op dezelfde manier toevoegen
	// updateTask, deleteTask, toggleTaskComplete, addEvent, addMoodEntry, etc.

	return useMemo(() => ({
		tasks,
		events,
		moods,
		focusSessions,
		badges,
		brainDump,
		hyperfocusLogs,
		reflections,
		focusStreak,
		tinyWins,
		isLoading,
		addTask,
	}), [tasks, events, moods, focusSessions, badges, brainDump, hyperfocusLogs, reflections, focusStreak, tinyWins, isLoading, addTask]);
});
