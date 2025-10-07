import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useOffline } from '../context/OfflineContext';

// Motivational quotes array
const quotes = [
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big things happen.", author: "John Wooden" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" }
];

export default function DashboardScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { colors } = useTheme();
  const { tasks, events, goals, toggleTask } = useApp();
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
  }).slice(0, 3);

  // Get daily quote (stable for the day)
  const dailyQuoteIndex = Math.floor((today.getTime() / (1000 * 60 * 60 * 24)) % quotes.length);
  const dailyQuote = quotes[dailyQuoteIndex];
  
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

      {/* Your Goals Preview */}
      <View style={styles.goalsSection}>
        <View style={styles.goalsSectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.goalsSectionTitle}>✨ Your Goals</Text>
            <TouchableOpacity 
              style={styles.smallAddButton}
              onPress={() => onNavigate?.('Goals')}
            >
              <Text style={styles.smallAddButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
          {goals.length > 0 ? (
            <View style={styles.goalsContainer}>
              {goals.slice(0, 4).map((goal) => {
                const completedTasks = goal.microTasks.filter(task => task.completed).length;
                const totalTasks = goal.microTasks.length;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                return (
                  <TouchableOpacity 
                    key={goal.id} 
                    style={styles.goalCard}
                    onPress={() => onNavigate?.('Goals')}
                  >
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalProgress}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill, 
                          { width: `${progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.goalSubtitle}>
                      {completedTasks} of {totalTasks} steps completed
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.goalCard}
              onPress={() => onNavigate?.('Goals')}
            >
              <Text style={styles.goalTitle}>🎯 Create Your First Goal</Text>
              <Text style={styles.goalSubtitle}>Tap to start achieving your dreams!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsSectionCard}>
          <Text style={styles.statsSectionTitle}>📊 This Week</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.filter(t => t.completed).length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tasks.filter(t => !t.completed).length}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.activitySection}>
        <View style={styles.activitySectionCard}>
          <Text style={styles.activitySectionTitle}>🏃‍♀️ Recent Activity</Text>
          <View style={styles.activityContainer}>
            {tasks.filter(t => t.completed).slice(0, 3).length > 0 ? (
              tasks.filter(t => t.completed).slice(0, 3).map((task, index) => (
                <View key={task.id} style={styles.activityCard}>
                  <Text style={styles.activityEmoji}>✅</Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>Completed "{task.title}"</Text>
                    <Text style={styles.activityTime}>Today</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.activityCard}>
                <Text style={styles.activityEmoji}>🎯</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>Ready to start your day!</Text>
                  <Text style={styles.activityTime}>Complete tasks to see activity</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Tomorrow's Preview Section */}
      <View style={styles.tomorrowSection}>
        <View style={styles.tomorrowSectionCard}>
          <Text style={styles.tomorrowSectionTitle}>🌅 Tomorrow Preview</Text>
          <View style={styles.tomorrowContainer}>
            <View style={styles.tomorrowCard}>
              <Text style={styles.tomorrowEmoji}>📅</Text>
              <Text style={styles.tomorrowLabel}>Morning Yoga Session</Text>
              <Text style={styles.tomorrowSubtext}>8:00 AM - 9:00 AM</Text>
            </View>
            <View style={[styles.tomorrowCard, { marginTop: 8 }]}>
              <Text style={styles.tomorrowEmoji}>☕</Text>
              <Text style={styles.tomorrowLabel}>Coffee with Sarah</Text>
              <Text style={styles.tomorrowSubtext}>10:30 AM - 11:30 AM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Motivational Quote Section */}
      <View style={styles.quoteSection}>
        <View style={styles.quoteSectionCard}>
          <Text style={styles.quoteSectionTitle}>💫 Daily Inspiration</Text>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              {dailyQuote.text}
            </Text>
            <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          </View>
        </View>
      </View>
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
  // Goals section styles
  goalPreview: {
    backgroundColor: colors.cardBackground,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  goalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Enhanced Goals section styles
  goalsSection: {
    marginBottom: 24,
  },
  goalsSectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 0,
    flex: 1,
  },
  goalsContainer: {
    gap: 12,
    marginTop: 16,
  },
  goalCard: {
    backgroundColor: colors.background,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Stats section styles
  statsSection: {
    marginBottom: 24,
  },
  statsSectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Tomorrow section styles
  tomorrowSection: {
    marginBottom: 24,
  },
  tomorrowSectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tomorrowSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  tomorrowContainer: {
    alignItems: 'center',
  },
  tomorrowCard: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  tomorrowEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tomorrowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tomorrowSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Quote section styles
  quoteSection: {
    marginBottom: 24,
  },
  quoteSectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  // Activity section styles
  activitySection: {
    marginBottom: 24,
  },
  activitySectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activitySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  activityContainer: {
    gap: 10,
  },
  activityCard: {
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
