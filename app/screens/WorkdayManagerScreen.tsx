import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export interface WorkdaySession {
  id: string;
  title: string;
  type: 'focus' | 'break' | 'lunch' | 'task';
  startTime: string; // HH:MM format
  endTime: string;
  completed: boolean;
  skipped: boolean;
  taskId?: string; // Reference to actual task if type is 'task'
  color: string;
}

interface TimeSlot {
  hour: number;
  minute: number;
}

// Time Picker Modal Component
interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  initialTime?: string;
  title: string;
  colors: any;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onTimeSelect,
  initialTime = '09:00',
  title,
  colors
}) => {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    if (initialTime) {
      const [hour, minute] = initialTime.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [initialTime]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const renderScrollPicker = (
    items: number[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    formatValue: (value: number) => string = (v) => v.toString().padStart(2, '0')
  ) => (
    <View style={timePickerStyles.pickerContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={timePickerStyles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={40}
        snapToAlignment="center"
        contentOffset={{ x: 0, y: selectedValue * 40 }}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              timePickerStyles.pickerItem,
              item === selectedValue && timePickerStyles.selectedPickerItem
            ]}
            onPress={() => onValueChange(item)}
          >
            <Text style={[
              timePickerStyles.pickerItemText,
              { color: item === selectedValue ? colors.primary : colors.textPrimary }
            ]}>
              {formatValue(item)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeSelect(timeString);
    onClose();
  };

  const timePickerStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 30,
      width: width * 0.85,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 30,
    },
    pickersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginBottom: 30,
    },
    pickerContainer: {
      width: 80,
      height: 200,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      overflow: 'hidden',
    },
    scrollContainer: {
      paddingVertical: 80,
    },
    pickerItem: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedPickerItem: {
      backgroundColor: colors.primaryLight || colors.primary + '20',
    },
    pickerItemText: {
      fontSize: 18,
      fontWeight: '500',
    },
    pickerLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: colors.inputBackground,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    confirmButtonText: {
      color: colors.background,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={timePickerStyles.modalOverlay}>
        <View style={timePickerStyles.modalContent}>
          <Text style={timePickerStyles.modalTitle}>{title}</Text>
          
          <View style={timePickerStyles.pickersContainer}>
            <View>
              {renderScrollPicker(hours, selectedHour, setSelectedHour)}
              <Text style={timePickerStyles.pickerLabel}>Hour</Text>
            </View>
            
            <Text style={{ fontSize: 24, color: colors.textPrimary, marginHorizontal: 20 }}>:</Text>
            
            <View>
              {renderScrollPicker(minutes, selectedMinute, setSelectedMinute)}
              <Text style={timePickerStyles.pickerLabel}>Minute</Text>
            </View>
          </View>
          
          <View style={timePickerStyles.modalActions}>
            <TouchableOpacity
              style={[timePickerStyles.modalButton, timePickerStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[timePickerStyles.buttonText, timePickerStyles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[timePickerStyles.modalButton, timePickerStyles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={[timePickerStyles.buttonText, timePickerStyles.confirmButtonText]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Success notification component
const SuccessNotification = ({ visible, colors }: { visible: boolean; colors: any }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const notificationStyles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
    },
    notification: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
      borderWidth: 2,
      borderColor: colors.success,
    },
    icon: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    emoji: {
      fontSize: 24,
    },
  });

  return (
    <Animated.View 
      style={[
        notificationStyles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={notificationStyles.notification}>
        <Text style={notificationStyles.icon}>🚀</Text>
        <Text style={notificationStyles.title}>Workday Started!</Text>
        <Text style={notificationStyles.subtitle}>
          Your productive day begins now
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={notificationStyles.emoji}>✨</Text>
          <Text style={notificationStyles.emoji}>💪</Text>
          <Text style={notificationStyles.emoji}>🌟</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Main component
export default function WorkdayManagerScreen() {
  const { tasks } = useApp();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [sessions, setSessions] = useState<WorkdaySession[]>([]);
  const [workdayStarted, setWorkdayStarted] = useState(false);
  const [workdayStart, setWorkdayStart] = useState('09:00');
  const [workdayEnd, setWorkdayEnd] = useState('17:00');
  const [autoBreaks, setAutoBreaks] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WorkdaySession | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  // Time picker modal state
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTitle, setTimePickerTitle] = useState('');
  const [timePickerType, setTimePickerType] = useState<'workdayStart' | 'workdayEnd' | 'editStart' | 'editEnd' | 'newStart' | 'newEnd'>('workdayStart');

  // Add session modal state
  const [addSessionModalVisible, setAddSessionModalVisible] = useState(false);
  const [newSessionType, setNewSessionType] = useState<'focus' | 'break' | 'lunch' | 'task'>('focus');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionStartTime, setNewSessionStartTime] = useState('');
  const [newSessionEndTime, setNewSessionEndTime] = useState('');

  // Edit sessions mode state
  const [editSessionsMode, setEditSessionsMode] = useState(false);

  // Success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Color themes for different session types
  const sessionColors = {
    focus: '#E8B4C4', // Blush pink
    break: '#B4E8D1', // Soft mint
    lunch: '#F5E6A3', // Pastel yellow
    task: '#C4B4E8', // Soft lilac
  };

  // Generate automatic workday schedule
  const generateWorkdaySchedule = (): WorkdaySession[] => {
    const newSessions: WorkdaySession[] = [];
    let currentTime = parseTimeString(workdayStart);
    const endTime = parseTimeString(workdayEnd);
    let sessionId = 1;

    // Get incomplete tasks to auto-schedule
    const incompleteTasks = tasks.filter(task => !task.completed).slice(0, 3);

    while (timeToMinutes(currentTime) < timeToMinutes(endTime)) {
      const sessionStart = formatTime(currentTime);
      
      // Determine session type and duration based on time and patterns
      let sessionType: 'focus' | 'break' | 'lunch' | 'task';
      let duration: number;
      let title: string;
      let taskId: string | undefined;

      const currentHour = currentTime.hour;
      const minutesFromStart = timeToMinutes(currentTime) - timeToMinutes(parseTimeString(workdayStart));

      // Lunch break around midday
      if (currentHour >= 12 && currentHour < 13 && newSessions.filter(s => s.type === 'lunch').length === 0) {
        sessionType = 'lunch';
        duration = 60; // 1 hour lunch
        title = '🍱 Lunch Break';
      }
      // Auto breaks every 2 hours if enabled
      else if (autoBreaks && minutesFromStart > 0 && minutesFromStart % 120 === 110) {
        sessionType = 'break';
        duration = 10;
        title = '☕ Coffee Break';
      }
      // Task slots for incomplete tasks
      else if (incompleteTasks.length > 0 && Math.random() < 0.3) {
        sessionType = 'task';
        duration = 30;
        const task = incompleteTasks.shift();
        title = `📋 ${task?.title || 'Task'}`;
        taskId = task?.id;
      }
      // Default focus sessions
      else {
        sessionType = 'focus';
        duration = 50; // Pomodoro-style focus
        title = '✨ Focus Session';
      }

      const sessionEnd = addMinutes(currentTime, duration);
      
      // Don't exceed workday end
      if (timeToMinutes(sessionEnd) > timeToMinutes(endTime)) {
        break;
      }

      newSessions.push({
        id: sessionId.toString(),
        title,
        type: sessionType,
        startTime: sessionStart,
        endTime: formatTime(sessionEnd),
        completed: false,
        skipped: false,
        taskId,
        color: sessionColors[sessionType],
      });

      sessionId++;
      currentTime = sessionEnd;

      // Add small buffer between sessions
      if (sessionType === 'focus') {
        currentTime = addMinutes(currentTime, 10); // 10 min break after focus
        
        if (timeToMinutes(currentTime) < timeToMinutes(endTime)) {
          newSessions.push({
            id: sessionId.toString(),
            title: '🌸 Quick Break',
            type: 'break',
            startTime: formatTime(addMinutes(sessionEnd, 0)),
            endTime: formatTime(currentTime),
            completed: false,
            skipped: false,
            color: sessionColors.break,
          });
          sessionId++;
        }
      }
    }

    return newSessions;
  };

  // Utility functions for time manipulation
  const parseTimeString = (timeStr: string): TimeSlot => {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
  };

  const formatTime = (time: TimeSlot): string => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const timeToMinutes = (time: TimeSlot): number => {
    return time.hour * 60 + time.minute;
  };

  const addMinutes = (time: TimeSlot, minutes: number): TimeSlot => {
    const totalMinutes = timeToMinutes(time) + minutes;
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  };

  // Calculate workday progress
  const getWorkdayProgress = (): number => {
    if (sessions.length === 0) return 0;
    const completedCount = sessions.filter(s => s.completed || s.skipped).length;
    return (completedCount / sessions.length) * 100;
  };

  // Get current/next session
  const getCurrentSession = (): WorkdaySession | null => {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return sessions.find(session => 
      currentTimeStr >= session.startTime && 
      currentTimeStr <= session.endTime &&
      !session.completed &&
      !session.skipped
    ) || null;
  };

  const getNextSession = (): WorkdaySession | null => {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return sessions.find(session => 
      session.startTime > currentTimeStr &&
      !session.completed &&
      !session.skipped
    ) || null;
  };

  // Time picker handlers
  const openTimePicker = (type: 'workdayStart' | 'workdayEnd' | 'editStart' | 'editEnd' | 'newStart' | 'newEnd', title: string) => {
    setTimePickerType(type);
    setTimePickerTitle(title);
    setTimePickerVisible(true);
  };

  const handleTimePickerSelect = (time: string) => {
    switch (timePickerType) {
      case 'workdayStart':
        setWorkdayStart(time);
        break;
      case 'workdayEnd':
        setWorkdayEnd(time);
        break;
      case 'editStart':
        setEditStartTime(time);
        break;
      case 'editEnd':
        setEditEndTime(time);
        break;
      case 'newStart':
        setNewSessionStartTime(time);
        break;
      case 'newEnd':
        setNewSessionEndTime(time);
        break;
    }
    setTimePickerVisible(false);
  };

  const getInitialTimeForPicker = (): string => {
    switch (timePickerType) {
      case 'workdayStart':
        return workdayStart;
      case 'workdayEnd':
        return workdayEnd;
      case 'editStart':
        return editStartTime;
      case 'editEnd':
        return editEndTime;
      case 'newStart':
        return newSessionStartTime || '09:00';
      case 'newEnd':
        return newSessionEndTime || '10:00';
      default:
        return '09:00';
    }
  };

  // Session actions
  const startWorkday = () => {
    console.log('Starting workday...'); // Debug log
    const newSchedule = generateWorkdaySchedule();
    console.log('Generated schedule:', newSchedule); // Debug log
    
    // Fallback if no sessions generated
    if (newSchedule.length === 0) {
      console.log('No sessions generated, creating fallback session');
      const fallbackSession: WorkdaySession = {
        id: '1',
        title: '✨ Focus Session',
        type: 'focus',
        startTime: workdayStart,
        endTime: workdayEnd,
        completed: false,
        skipped: false,
        color: sessionColors.focus,
      };
      setSessions([fallbackSession]);
    } else {
      setSessions(newSchedule);
    }
    
    setWorkdayStarted(true);
    
    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000); // Hide after 3 seconds
    
    console.log('Workday started successfully!'); // Debug log
  };

  const resetWorkday = () => {
    console.log('Reset workday button pressed'); // Debug log
    
    Alert.alert(
      'Reset Workday',
      'Are you sure you want to reset your workday schedule? This will clear all sessions and stop your current workday.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Reset cancelled')
        },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            console.log('Reset confirmed, clearing all data'); // Debug log
            
            try {
              // Clear all sessions
              setSessions([]);
              console.log('Sessions cleared');
              
              // Stop workday
              setWorkdayStarted(false);
              console.log('Workday stopped');
              
              // Reset workday times to defaults
              setWorkdayStart('09:00');
              setWorkdayEnd('17:00');
              setAutoBreaks(true);
              console.log('Times reset to defaults');
              
              // Clear any modal states
              setEditModalVisible(false);
              setAddSessionModalVisible(false);
              setTimePickerVisible(false);
              setSelectedSession(null);
              console.log('Modals cleared');
              
              // Clear edit form data
              setEditTitle('');
              setEditStartTime('');
              setEditEndTime('');
              console.log('Edit form cleared');
              
              // Clear new session form data
              setNewSessionTitle('');
              setNewSessionStartTime('');
              setNewSessionEndTime('');
              setNewSessionType('focus');
              console.log('New session form cleared');
              
              // Reset time picker state
              setTimePickerType('workdayStart');
              setTimePickerTitle('');
              console.log('Time picker state reset');
              
              // Hide success notification if showing
              setShowSuccessNotification(false);
              console.log('Success notification hidden');
              
              console.log('Reset completed successfully'); // Debug log
              
              // Show success message
              setTimeout(() => {
                Alert.alert('Success', 'Workday has been reset successfully!');
              }, 100);
              
            } catch (error) {
              console.error('Error during reset:', error);
              Alert.alert('Error', 'Something went wrong during reset. Please try again.');
            }
          }
        }
      ]
    );
  };

  const markSessionComplete = (sessionId: string) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, completed: true }
        : session
    ));
  };

  const markSessionSkipped = (sessionId: string) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, skipped: true }
        : session
    ));
  };

  const openEditModal = (session: WorkdaySession) => {
    setSelectedSession(session);
    setEditTitle(session.title);
    setEditStartTime(session.startTime);
    setEditEndTime(session.endTime);
    setEditModalVisible(true);
  };

  const saveSessionEdit = () => {
    if (!selectedSession) return;

    setSessions(prev => prev.map(session =>
      session.id === selectedSession.id
        ? {
            ...session,
            title: editTitle,
            startTime: editStartTime,
            endTime: editEndTime,
          }
        : session
    ));

    setEditModalVisible(false);
    setSelectedSession(null);
  };

  const addCustomSession = () => {
    // Open modal for adding new session
    setNewSessionTitle('');
    setNewSessionStartTime('');
    setNewSessionEndTime('');
    setNewSessionType('focus');
    setAddSessionModalVisible(true);
  };

  const saveNewSession = () => {
    if (!newSessionTitle || !newSessionStartTime || !newSessionEndTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newSession: WorkdaySession = {
      id: Date.now().toString(),
      title: newSessionTitle,
      type: newSessionType,
      startTime: newSessionStartTime,
      endTime: newSessionEndTime,
      completed: false,
      skipped: false,
      color: sessionColors[newSessionType],
    };

    // Insert the session in the correct chronological order
    const newSessions = [...sessions, newSession].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    setSessions(newSessions);
    setAddSessionModalVisible(false);
  };

  const deleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSessions(prev => prev.filter(session => session.id !== sessionId));
          }
        }
      ]
    );
  };

  const moveSession = (sessionId: string, direction: 'up' | 'down') => {
    const currentIndex = sessions.findIndex(s => s.id === sessionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sessions.length) return;

    const newSessions = [...sessions];
    [newSessions[currentIndex], newSessions[newIndex]] = [newSessions[newIndex], newSessions[currentIndex]];
    
    // Recalculate times for all sessions after moving
    const recalculatedSessions = recalculateSessionTimes(newSessions);
    setSessions(recalculatedSessions);
  };

  // Helper function to recalculate all session times
  const recalculateSessionTimes = (sessionList: WorkdaySession[]) => {
    let currentTime = workdayStart;
    
    return sessionList.map((session) => {
      const startTime = currentTime;
      const duration = timeToMinutes(parseTimeString(session.endTime)) - 
                      timeToMinutes(parseTimeString(session.startTime));
      const endTime = formatTime(addMinutes(parseTimeString(startTime), duration));
      
      currentTime = endTime;
      
      return {
        ...session,
        startTime,
        endTime
      };
    });
  };

  const currentSession = getCurrentSession();
  const nextSession = getNextSession();
  const progress = getWorkdayProgress();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {workdayStarted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}% complete
            </Text>
          </View>
        )}
      </View>

      {/* Current/Next Session Info */}
      {workdayStarted && (currentSession || nextSession) && (
        <View style={styles.currentSessionContainer}>
          {currentSession ? (
            <View style={[styles.currentSessionCard, { backgroundColor: currentSession.color }]}>
              <Text style={styles.currentSessionLabel}>NOW</Text>
              <Text style={styles.currentSessionTitle}>{currentSession.title}</Text>
              <Text style={styles.currentSessionTime}>
                {currentSession.startTime} - {currentSession.endTime}
              </Text>
            </View>
          ) : nextSession ? (
            <View style={[styles.nextSessionCard, { backgroundColor: nextSession.color }]}>
              <Text style={styles.nextSessionLabel}>NEXT UP</Text>
              <Text style={styles.nextSessionTitle}>{nextSession.title}</Text>
              <Text style={styles.nextSessionTime}>
                {nextSession.startTime} - {nextSession.endTime}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Main Content */}
      {!workdayStarted ? (
        /* Setup Screen */
        <View style={styles.setupContainer}>
          <View style={styles.settingsContainer}>
            <View style={styles.timeSettingRow}>
              <Text style={styles.settingLabel}>🕘 Start time:</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker('workdayStart', 'Select Start Time')}
              >
                <Text style={styles.timeButtonText}>{workdayStart}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeSettingRow}>
              <Text style={styles.settingLabel}>🕔 End time:</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => openTimePicker('workdayEnd', 'Select End Time')}
              >
                <Text style={styles.timeButtonText}>{workdayEnd}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setAutoBreaks(!autoBreaks)}
            >
              <Text style={styles.settingLabel}>🧘 Auto breaks</Text>
              <View style={[styles.toggle, autoBreaks && styles.toggleActive]}>
                <View style={[styles.toggleThumb, autoBreaks && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

                    <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.startButton} onPress={startWorkday}>
              <Text style={styles.startButtonText}>🚀 Start My Workday</Text>
            </TouchableOpacity>
          </View>

        </View>
      ) : (
        /* Timeline View */
        <ScrollView style={styles.timelineContainer} showsVerticalScrollIndicator={false}>
          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                { backgroundColor: session.color },
                session.completed && styles.sessionCompleted,
                session.skipped && styles.sessionSkipped,
              ]}
              onPress={() => openEditModal(session)}
            >
              {/* Top row: Time and main content */}
              <View style={styles.sessionTopRow}>
                <View style={styles.sessionTimeContainer}>
                  <Text style={styles.sessionTime}>
                    {session.startTime}
                  </Text>
                  <Text style={styles.sessionDuration}>
                    {session.endTime}
                  </Text>
                </View>
                
                <View style={styles.sessionContent}>
                  <Text 
                    style={[
                      styles.sessionTitle,
                      (session.completed || session.skipped) && styles.sessionTitleCompleted
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {session.title}
                  </Text>
                </View>
              </View>

              {/* Bottom row: Action buttons */}
                            <View style={styles.sessionActions}>
                {!session.completed && !session.skipped && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        markSessionComplete(session.id);
                      }}
                    >
                      <Text style={styles.actionButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.skipButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        markSessionSkipped(session.id);
                      }}
                    >
                      <Text style={styles.actionButtonText}>⤵</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Move and Delete buttons - always visible */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.moveButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    const sessionIndex = sessions.findIndex(s => s.id === session.id);
                    if (sessionIndex > 0) moveSession(session.id, 'up');
                  }}
                  disabled={sessions.findIndex(s => s.id === session.id) === 0}
                >
                  <Text style={[styles.actionButtonText, sessions.findIndex(s => s.id === session.id) === 0 && styles.disabledText]}>↑</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.moveButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    const sessionIndex = sessions.findIndex(s => s.id === session.id);
                    if (sessionIndex < sessions.length - 1) moveSession(session.id, 'down');
                  }}
                  disabled={sessions.findIndex(s => s.id === session.id) === sessions.length - 1}
                >
                  <Text style={[styles.actionButtonText, sessions.findIndex(s => s.id === session.id) === sessions.length - 1 && styles.disabledText]}>↓</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Text style={styles.actionButtonText}>🗑</Text>
                </TouchableOpacity>

                {session.completed && (
                  <View style={styles.statusIndicator}>
                    <Text style={styles.statusText}>✓ Done</Text>
                  </View>
                )}
                {session.skipped && (
                  <View style={styles.statusIndicator}>
                    <Text style={styles.statusText}>⤵ Skipped</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Edit Session Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Session</Text>
            
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Session title"
            />
            
            <Text style={styles.inputLabel}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimePicker('editStart', 'Select Start Time')}
            >
              <Text style={styles.timeButtonText}>{editStartTime || 'HH:MM'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.inputLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimePicker('editEnd', 'Select End Time')}
            >
              <Text style={styles.timeButtonText}>{editEndTime || 'HH:MM'}</Text>
            </TouchableOpacity>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveSessionEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Session Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addSessionModalVisible}
        onRequestClose={() => setAddSessionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Session</Text>
            
            <Text style={styles.inputLabel}>Session Type</Text>
            <View style={styles.typeSelector}>
              {(['focus', 'break', 'lunch', 'task'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newSessionType === type && styles.typeButtonSelected,
                    { backgroundColor: newSessionType === type ? sessionColors[type] : colors.cardBackground }
                  ]}
                  onPress={() => setNewSessionType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    { color: newSessionType === type ? colors.text : colors.textSecondary }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              value={newSessionTitle}
              onChangeText={setNewSessionTitle}
              placeholder={`Enter ${newSessionType} session title`}
            />
            
            <Text style={styles.inputLabel}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimePicker('newStart', 'Select Start Time')}
            >
              <Text style={styles.timeButtonText}>{newSessionStartTime || 'HH:MM'}</Text>
            </TouchableOpacity>
            
            <Text style={styles.inputLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimePicker('newEnd', 'Select End Time')}
            >
              <Text style={styles.timeButtonText}>{newSessionEndTime || 'HH:MM'}</Text>
            </TouchableOpacity>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddSessionModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNewSession}
              >
                <Text style={styles.saveButtonText}>Add Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onTimeSelect={handleTimePickerSelect}
        initialTime={getInitialTimeForPicker()}
        title={timePickerTitle}
        colors={colors}
      />

      {/* Success Notification */}
      <SuccessNotification visible={showSuccessNotification} colors={colors} />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 12,
    paddingTop: 20,
    backgroundColor: colors.secondary,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.progressBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  currentSessionContainer: {
    margin: 16,
    marginBottom: 8,
  },
  currentSessionCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextSessionCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentSessionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  nextSessionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  currentSessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  nextSessionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  currentSessionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  nextSessionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  setupContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  setupSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  settingsContainer: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 12,
  },
  timeSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'center',
    backgroundColor: colors.cardBackground,
    color: colors.text,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
  },
  toggleThumbActive: {
    transform: [{ translateX: 26 }],
  },
  explanationBox: {
    backgroundColor: colors.primaryLight || colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  explanationText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
  },
  setupButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editSetupButton: {
    backgroundColor: colors.primaryLight || colors.primary + '20',
  },
  setupButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sessionsPreview: {
    marginTop: 20,
    maxHeight: 400,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  doneEditingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  doneEditingText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
  previewContainer: {
    maxHeight: 300,
  },
  previewSessionCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    alignItems: 'center',
  },
  quickStartButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickStartButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    flex: 1,
    padding: 16,
  },
  sessionCard: {
    flexDirection: 'column',
    padding: 16,
    minHeight: 100,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionCompleted: {
    opacity: 0.7,
  },
  sessionSkipped: {
    opacity: 0.5,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTimeContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  sessionDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sessionContent: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'left',
    lineHeight: 20,
  },
  sessionTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  sessionType: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  skipButton: {
    backgroundColor: colors.border,
  },
  moveButton: {
    backgroundColor: colors.secondaryLight || colors.secondary + '40',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b40',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.3,
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.cardBackground,
  },
  statusText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: colors.modalContent,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: colors.background,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  topButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  resetTopButton: {
    backgroundColor: colors.accent,
  },
  editTopButton: {
    backgroundColor: colors.secondary,
  },
  editActiveButton: {
    backgroundColor: colors.primary,
  },
  topButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
});

// Fix color references in the modal
const getInputBackgroundColor = (colors: any) => {
  return colors.inputBackground || colors.cardBackground;
};

const getTextPrimaryColor = (colors: any) => {
  return colors.textPrimary || colors.text;
};