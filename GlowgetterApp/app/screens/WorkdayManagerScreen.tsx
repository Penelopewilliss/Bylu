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
} from 'react-native';
import { useApp } from '../context/AppContext';

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

export default function WorkdayManagerScreen() {
  const { tasks } = useApp();
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

  // Session actions
  const startWorkday = () => {
    const newSchedule = generateWorkdaySchedule();
    setSessions(newSchedule);
    setWorkdayStarted(true);
  };

  const resetWorkday = () => {
    Alert.alert(
      'Reset Workday',
      'Are you sure you want to reset your workday schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setSessions([]);
            setWorkdayStarted(false);
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
    // Add a custom session at the end
    const lastSession = sessions[sessions.length - 1];
    const startTime = lastSession ? lastSession.endTime : workdayStart;
    
    const newSession: WorkdaySession = {
      id: (sessions.length + 1).toString(),
      title: '✨ Custom Session',
      type: 'focus',
      startTime,
      endTime: formatTime(addMinutes(parseTimeString(startTime), 30)),
      completed: false,
      skipped: false,
      color: sessionColors.focus,
    };

    setSessions(prev => [...prev, newSession]);
  };

  const currentSession = getCurrentSession();
  const nextSession = getNextSession();
  const progress = getWorkdayProgress();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.motivationText}>
          ✨ Let's make today productive!
        </Text>
        
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
              <Text style={styles.settingLabel}>Start time:</Text>
              <TextInput
                style={styles.timeInput}
                value={workdayStart}
                onChangeText={setWorkdayStart}
                placeholder="09:00"
              />
            </View>
            
            <View style={styles.timeSettingRow}>
              <Text style={styles.settingLabel}>End time:</Text>
              <TextInput
                style={styles.timeInput}
                value={workdayEnd}
                onChangeText={setWorkdayEnd}
                placeholder="17:00"
              />
            </View>
            
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setAutoBreaks(!autoBreaks)}
            >
              <Text style={styles.settingLabel}>Auto breaks</Text>
              <View style={[styles.toggle, autoBreaks && styles.toggleActive]}>
                <View style={[styles.toggleThumb, autoBreaks && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startWorkday}>
            <Text style={styles.startButtonText}>🚀 Start My Workday</Text>
          </TouchableOpacity>
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
              <View style={styles.sessionTimeContainer}>
                <Text style={styles.sessionTime}>
                  {session.startTime}
                </Text>
                <Text style={styles.sessionDuration}>
                  {session.endTime}
                </Text>
              </View>
              
              <View style={styles.sessionContent}>
                <Text style={[
                  styles.sessionTitle,
                  (session.completed || session.skipped) && styles.sessionTitleCompleted
                ]}>
                  {session.title}
                </Text>
                <Text style={styles.sessionType}>
                  {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                </Text>
              </View>
              
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

      {/* Floating Action Buttons */}
      {workdayStarted && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={addCustomSession}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.fab, styles.resetFab]} onPress={resetWorkday}>
            <Text style={styles.fabText}>🔄</Text>
          </TouchableOpacity>
        </View>
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
            <TextInput
              style={styles.modalInput}
              value={editStartTime}
              onChangeText={setEditStartTime}
              placeholder="HH:MM"
            />
            
            <Text style={styles.inputLabel}>End Time</Text>
            <TextInput
              style={styles.modalInput}
              value={editEndTime}
              onChangeText={setEditEndTime}
              placeholder="HH:MM"
            />
            
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 12, // Reduced from 16
    paddingTop: 20, // Reduced from 30
    backgroundColor: '#F7D1DA',
    borderBottomLeftRadius: 15, // Slightly smaller radius
    borderBottomRightRadius: 15,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    color: '#C2185B',
    textAlign: 'center',
    marginBottom: 8, // Reduced from 12
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C2185B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B6B6B',
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
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentSessionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 2,
  },
  nextSessionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 2,
  },
  currentSessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 2,
  },
  nextSessionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 2,
  },
  currentSessionTime: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  nextSessionTime: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  setupContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 6,
  },
  setupSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  settingsContainer: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 20,
  },
  timeSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'center',
    backgroundColor: '#FFF',
  },
  toggle: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#C2185B',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 26 }],
  },
  startButton: {
    backgroundColor: '#C2185B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineContainer: {
    flex: 1,
    padding: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
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
  sessionTimeContainer: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D2D2D',
  },
  sessionDuration: {
    fontSize: 10,
    color: '#6B6B6B',
    marginTop: 1,
  },
  sessionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 1,
  },
  sessionTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  sessionType: {
    fontSize: 10,
    color: '#6B6B6B',
    textTransform: 'capitalize',
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  skipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusText: {
    fontSize: 10,
    color: '#6B6B6B',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 25,
    right: 16,
    alignItems: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C2185B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetFab: {
    backgroundColor: '#FF7043',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fabText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 6,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
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
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#C2185B',
  },
  cancelButtonText: {
    color: '#6B6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});