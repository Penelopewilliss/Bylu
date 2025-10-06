import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useOffline } from '../context/OfflineContext';

export default function DashboardScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { colors } = useTheme();
  const { tasks, events, toggleTask } = useApp();
  const { isOnline, addToSyncQueue } = useOffline();
  const styles = createStyles(colors);

  // Enhanced task toggle with offline support
  const handleTaskToggle = async (taskId: string) => {
    try {
      // Always update UI immediately for better UX
      toggleTask(taskId);
      
      // Queue for sync if offline or sync immediately if online
      await addToSyncQueue('UPDATE', 'task', { 
        id: taskId, 
        completed: !tasks.find(t => t.id === taskId)?.completed,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`${isOnline ? '🔄' : '📱'} Task toggle queued: ${taskId}`);
    } catch (error) {
      console.error('❌ Failed to toggle task:', error);
    }
  };

  // Get today's tasks and events
  const todayTasks = tasks.filter(task => !task.completed).slice(0, 3);
  
  // Get today's appointments (filter events for today)
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const todayAppointments = events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    return eventDate === todayString;
  }).slice(0, 3); // Limit to 3 appointments
  
  const todayEvents = events.slice(0, 2);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Today's Appointments Section */}
      {todayAppointments.length > 0 ? (
        <View style={styles.appointmentsSection}>
          <View style={styles.appointmentsSectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.appointmentsSectionTitle}>Today's Appointments</Text>
              <TouchableOpacity 
                style={styles.smallAddButton}
                onPress={() => onNavigate?.('Calendar')}
              >
                <Text style={styles.smallAddButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.appointmentsContainer}>
              {todayAppointments.map((appointment, index) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentContent}>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentTitle}>
                        {appointment.title}
                      </Text>
                      <Text style={styles.appointmentTime}>
                        {new Date(appointment.startDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {appointment.endDate && 
                          ` - ${new Date(appointment.endDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}`
                        }
                      </Text>
                    </View>
                    <View style={[styles.appointmentDot, { backgroundColor: appointment.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.appointmentsSection}>
          <View style={styles.appointmentsSectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.appointmentsSectionTitle}>Today's Appointments</Text>
              <TouchableOpacity 
                style={styles.smallAddButton}
                onPress={() => onNavigate?.('Calendar')}
              >
                <Text style={styles.smallAddButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emptyAppointmentsContainer}>
              <Text style={styles.emptyAppointmentsText}>📅 No appointments today</Text>
              <Text style={styles.emptyAppointmentsSubtext}>Enjoy your free time!</Text>
            </View>
          </View>
        </View>
      )}

      {/* Today's Tasks Preview */}
      {todayTasks.length > 0 ? (
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.tasksSectionTitle}>Today's Tasks</Text>
              <TouchableOpacity 
                style={styles.smallAddButton}
                onPress={() => onNavigate?.('Tasks')}
              >
                <Text style={styles.smallAddButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tasksContainer}>
              {todayTasks.map((task, index) => (
                <TouchableOpacity key={task.id} style={styles.taskCard}>
                  <View style={styles.taskContent}>
                    <TouchableOpacity 
                      style={styles.heartCheckbox}
                      onPress={() => handleTaskToggle(task.id)}
                    >
                      <Text style={styles.heartIcon}>🤍</Text>
                    </TouchableOpacity>
                    <Text style={styles.taskTitle}>
                      {task.title}
                    </Text>
                    <View style={[styles.priorityBadge, { backgroundColor: 
                      task.priority === 'high' ? colors.peach : 
                      task.priority === 'medium' ? colors.accent : colors.lavender 
                    }]}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.tasksSectionTitle}>Today's Tasks</Text>
              <TouchableOpacity 
                style={styles.smallAddButton}
                onPress={() => onNavigate?.('Tasks')}
              >
                <Text style={styles.smallAddButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emptyTasksContainer}>
              <Text style={styles.emptyTasksText}>🎉 All tasks completed!</Text>
              <Text style={styles.emptyTasksSubtext}>Great job staying productive!</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate?.('Calendar')}>
          <Text style={styles.cardEmoji}>📅</Text>
          <Text style={styles.cardTitle}>Calendar</Text>
          <Text style={styles.cardSubtitle}>View schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate?.('Tasks')}>
          <Text style={styles.cardEmoji}>📝</Text>
          <Text style={styles.cardTitle}>Tasks</Text>
          <Text style={styles.cardSubtitle}>Manage todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate?.('Goals')}>
          <Text style={styles.cardEmoji}>✨</Text>
          <Text style={styles.cardTitle}>Goals</Text>
          <Text style={styles.cardSubtitle}>Track progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate?.('Settings')}>
          <Text style={styles.cardEmoji}>🌸</Text>
          <Text style={styles.cardTitle}>Settings</Text>
          <Text style={styles.cardSubtitle}>Preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Events Preview */}
      {todayEvents.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {todayEvents.map((event, index) => (
            <TouchableOpacity key={event.id || index} style={styles.eventPreview}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>{event.startDate}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(247, 209, 218, 0.3)',
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.buttonText,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.buttonText,
    textAlign: 'center',
    opacity: 0.9,
  },
  tasksSection: {
    marginBottom: 24,
  },
  tasksSectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 0,
    flex: 1,
  },
  tasksContainer: {
    gap: 12,
    marginTop: 16,
  },
  taskCard: {
    backgroundColor: colors.background,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  taskPreview: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 18,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
    marginLeft: 12,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
    opacity: 0.6,
  },
  heartCheckbox: {
    paddingHorizontal: 4,
  },
  heartIcon: {
    fontSize: 24,
  },
  emptyTasksContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyTasksText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTasksSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  taskPriority: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  eventPreview: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Appointments section styles
  appointmentsSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  appointmentsSectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 0,
    flex: 1,
  },
  appointmentsContainer: {
    gap: 12,
    marginTop: 16,
  },
  appointmentCard: {
    backgroundColor: colors.background,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appointmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  appointmentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  emptyAppointmentsContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyAppointmentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyAppointmentsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Section header styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  smallAddButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(247, 209, 218, 0.5)',
  },
  smallAddButtonText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
});
