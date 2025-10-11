// App-wide configuration constants
// Centralizing magic numbers for better maintainability

export const APP_CONFIG = {
  // Timing Constants
  SPLASH_DURATION: 2500, // ms
  ANIMATION_DURATION: 300, // ms
  SOUND_PREVIEW_MAX_DURATION: 4000, // ms
  NOTIFICATION_DURATION: 3000, // ms
  DEBOUNCE_DELAY: 300, // ms
  
  // Audio Constants
  SOUND_PREVIEW_LENGTH: 4000, // ms
  RECORDING_MAX_DURATION: 300000, // 5 minutes in ms
  
  // UI Constants
  MAX_TASK_TITLE_LENGTH: 100,
  MAX_TASK_DESCRIPTION_LENGTH: 500,
  MAX_THOUGHT_LENGTH: 500,
  MAX_GOAL_TITLE_LENGTH: 100,
  
  // Pagination
  TASKS_PER_PAGE: 20,
  INITIAL_NUM_TO_RENDER: 15,
  MAX_TO_RENDER_PER_BATCH: 20,
  WINDOW_SIZE: 10,
  
  // Cache & Storage
  CACHE_EXPIRY_HOURS: 24,
  MAX_STORAGE_SIZE_MB: 50,
  
  // Validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_EMAIL_LENGTH: 254,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  
  // Network
  NETWORK_TIMEOUT: 5000, // ms
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
  
  // Alarm
  SNOOZE_DURATION_MINUTES: 9,
  MAX_ALARMS: 20,
  
  // Performance
  SHOULD_USE_NATIVE_DRIVER: true,
} as const;

export const STORAGE_KEYS = {
  ONBOARDING: '@planner_onboarding_completed',
  USER_PREFERENCES: '@user_preferences',
  CACHED_DATA: '@cached_data',
  LAST_SYNC: '@last_sync_timestamp',
} as const;

export const ERROR_MESSAGES = {
  // Auth
  AUTH_FAILED: 'Authentication failed. Please try again.',
  AUTH_EMAIL_IN_USE: 'This email is already registered.',
  AUTH_INVALID_EMAIL: 'Please enter a valid email address.',
  AUTH_WEAK_PASSWORD: 'Password must be at least 6 characters.',
  AUTH_WRONG_PASSWORD: 'Incorrect password. Please try again.',
  AUTH_USER_NOT_FOUND: 'No account found with this email.',
  AUTH_NETWORK_ERROR: 'Network error. Check your connection.',
  
  // Sync
  SYNC_FAILED: 'Could not sync your data. Will retry when online.',
  SYNC_OFFLINE: 'You are offline. Changes will sync when reconnected.',
  
  // Data Operations
  LOAD_FAILED: 'Could not load your data. Please restart the app.',
  SAVE_FAILED: 'Could not save changes. Please try again.',
  DELETE_FAILED: 'Could not delete item. Please try again.',
  
  // Voice/Audio
  AUDIO_PERMISSION_DENIED: 'Microphone permission is required to record voice memos.',
  AUDIO_PLAYBACK_FAILED: 'Could not play audio. File may be corrupted.',
  AUDIO_RECORDING_FAILED: 'Recording failed. Please try again.',
  
  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Check your internet connection.',
} as const;

export const SUCCESS_MESSAGES = {
  TASK_COMPLETED: '✨ Task completed!',
  GOAL_ACHIEVED: '🎉 Goal achieved!',
  THOUGHT_CAPTURED: '💭 Thought captured!',
  VOICE_MEMO_SAVED: '🎤 Voice memo saved!',
  SYNC_SUCCESS: '☁️ Data synced successfully!',
  SETTINGS_SAVED: '✅ Settings saved!',
} as const;
