import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useOffline } from '../context/OfflineContext';
import { Category } from '../types';

// Category emoji mapping (matching TasksScreen)
const TASK_CATEGORIES: Record<Category, { emoji: string; label: string; color: string }> = {
  work: { emoji: '💼', label: 'Work', color: '#B8C5F2' },
  personal: { emoji: '👤', label: 'Personal', color: '#E8B4F0' },
  household: { emoji: '🏠', label: 'Household', color: '#FFD19A' },
  groceries: { emoji: '🛒', label: 'Groceries', color: '#B8E6B8' },
  calls: { emoji: '📞', label: 'Calls', color: '#A8D4FF' },
  shopping: { emoji: '🛍️', label: 'Shopping', color: '#FFB3D1' },
  errands: { emoji: '🚗', label: 'Errands', color: '#E8B4F0' },
  finances: { emoji: '💰', label: 'Finances', color: '#D4B5A0' },
  health: { emoji: '🏥', label: 'Health', color: '#FFB3B3' },
  fitness: { emoji: '💪', label: 'Fitness', color: '#D4E8B8' },
  learning: { emoji: '📚', label: 'Learning', color: '#C8B4E8' },
  hobbies: { emoji: '🎨', label: 'Hobbies', color: '#A3D4D0' },
  other: { emoji: '📝', label: 'Other', color: '#607D8B' },
};

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
  const [showCloudTutorial, setShowCloudTutorial] = useState(false); // Will be loaded from storage
  const [showDailyInspiration, setShowDailyInspiration] = useState(false); // Hide daily inspiration initially
  const styles = createStyles(colors);

  // Load tutorial state from storage on component mount
  useEffect(() => {
    const loadTutorialState = async () => {
      try {
        const tutorialCompleted = await AsyncStorage.getItem('@cloud_tutorial_completed');
        if (!tutorialCompleted) {
          setShowCloudTutorial(true); // Show tutorial only if not completed before
        }
      } catch (error) {
        console.log('Error loading tutorial state:', error);
        setShowCloudTutorial(true); // Show tutorial on error to be safe
      }
    };
    
    loadTutorialState();
  }, []);

  // Helper function for time-based greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

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

  // Get high priority tasks
  const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'high').slice(0, 3);
  
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
      {/* Dashboard Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText} numberOfLines={0}>Good {getTimeOfDay()}, beautiful!</Text>
        <Text style={styles.dateText}>{today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      {/* Today's Appointments Section */}
      <View style={styles.sectionWrapper}>
        {/* Cloud and Pink Line Container */}
        <View style={styles.cloudLineContainer}>
          {/* Quick Thought Cloud Button - Positioned Right */}
          <TouchableOpacity 
            style={styles.quickThoughtCloud}
            onPress={async () => {
              if (showCloudTutorial) {
                // First time clicking - save to storage and hide tutorial permanently
                try {
                  await AsyncStorage.setItem('@cloud_tutorial_completed', 'true');
                } catch (error) {
                  console.log('Error saving tutorial state:', error);
                }
                setShowCloudTutorial(false);
              }
              setShowDailyInspiration(!showDailyInspiration);
              onNavigate?.('BrainDump'); // Navigate to BrainDump page
            }}
          >
            <Text style={styles.cloudIcon}>💭</Text>
          </TouchableOpacity>
          
          {/* Tutorial Arrow for First-Time Users */}
          {showCloudTutorial && (
            <View style={styles.tutorialContainer}>
              <Text style={styles.tutorialText}>Click here!</Text>
              <Text style={styles.tutorialArrow}>→</Text>
            </View>
          )}
          
          {/* Pink Line Separator */}
          <View style={styles.pinkLineSeparator} />
        </View>
        
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
        </View>
        
        <View style={styles.sectionCard}>
          {todayAppointments.length > 0 ? (
            <View style={styles.contentList}>
              {todayAppointments.map((appointment, index) => (
                <View key={appointment.id} style={styles.contentItem}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle}>{appointment.title}</Text>
                      <Text style={styles.itemSubtitle}>
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
                    <View style={[styles.statusDot, { backgroundColor: appointment.color || colors.primary }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>No appointments today</Text>
              <Text style={styles.emptySubtitle}>Enjoy your free time! 🌸</Text>
            </View>
          )}
          
          {/* Add Button - Bottom Right */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => onNavigate?.('Calendar')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Separator */}
      <View style={styles.majorSeparator} />

      {/* High Priority Tasks Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>High Priority Tasks</Text>
        </View>
        
        <View style={styles.sectionCard}>
          {highPriorityTasks.length > 0 ? (
            <View style={styles.contentList}>
              {highPriorityTasks.map((task, index) => {
                const categoryData = TASK_CATEGORIES[task.category] || TASK_CATEGORIES.other;
                return (
                  <View key={task.id} style={styles.contentItem}>
                    <View style={styles.dashboardTaskContent}>
                      <View style={styles.dashboardTaskHeader}>
                        {/* Priority emojis */}
                        {task.priority === 'high' && (
                          <Text style={styles.dashboardPriorityText}>⚡</Text>
                        )}
                        {task.priority === 'medium' && (
                          <Text style={styles.dashboardPriorityText}>🔶</Text>
                        )}
                        {task.priority === 'low' && (
                          <Text style={styles.dashboardPriorityText}>🌴</Text>
                        )}
                        
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        
                        {/* Work emoji in a small box after title */}
                        <View style={styles.categoryEmojiBox}>
                          <Text style={styles.categoryEmoji}>{categoryData.emoji}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.taskCheckbox}
                      onPress={() => handleTaskToggle(task.id)}
                    >
                      <Text style={styles.heartIcon}>🤍</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>All tasks completed!</Text>
              <Text style={styles.emptySubtitle}>Great job staying productive! 🎉</Text>
            </View>
          )}
          
          {/* Add Button - Bottom Right */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => onNavigate?.('Tasks')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Separator */}
      <View style={styles.majorSeparator} />

      {/* Your Goals Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
        </View>
        
        <View style={styles.sectionCard}>
          {goals.length > 0 ? (
            <View style={styles.contentList}>
              {goals.slice(0, 4).map((goal) => {
                const completedTasks = goal.microTasks.filter(task => task.completed).length;
                const totalTasks = goal.microTasks.length;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                
                return (
                  <View key={goal.id} style={styles.contentItem}>
                    <View style={styles.goalContent}>
                      <View style={styles.goalHeader}>
                        <Text style={styles.itemTitle}>{goal.title}</Text>
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
                      <Text style={styles.itemSubtitle}>
                        {completedTasks} of {totalTasks} steps completed
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Create Your First Goal</Text>
              <Text style={styles.emptySubtitle}>Tap to start achieving your dreams! 🎯</Text>
            </View>
          )}
          
          {/* Add Button - Bottom Right */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => onNavigate?.('Goals')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Separator */}
      <View style={styles.majorSeparator} />

      {/* Tomorrow's Preview Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Tomorrow Preview</Text>
        </View>
        
        <View style={styles.sectionCard}>
          <View style={styles.contentList}>
            <View style={styles.contentItem}>
              <View style={styles.itemContent}>
                <Text style={styles.previewEmoji}>📅</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>Morning Yoga Session</Text>
                  <Text style={styles.itemSubtitle}>8:00 AM - 9:00 AM</Text>
                </View>
              </View>
            </View>
            <View style={styles.contentItem}>
              <View style={styles.itemContent}>
                <Text style={styles.previewEmoji}>☕</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>Coffee with Sarah</Text>
                  <Text style={styles.itemSubtitle}>10:30 AM - 11:30 AM</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Section Separator */}
      <View style={styles.majorSeparator} />

      {/* Recent Activity Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        
        <View style={styles.sectionCard}>
          {tasks.filter(t => t.completed).slice(0, 3).length > 0 ? (
            <View style={styles.contentList}>
              {tasks.filter(t => t.completed).slice(0, 3).map((task, index) => (
                <View key={task.id} style={styles.activityItem}>
                  <Text style={styles.activityEmoji}>✅</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>Completed "{task.title}"</Text>
                    <Text style={styles.itemSubtitle}>Today</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Ready to start your day!</Text>
              <Text style={styles.emptySubtitle}>Complete tasks to see activity 🎯</Text>
            </View>
          )}
        </View>
      </View>

      {/* Section Separator */}
      <View style={styles.majorSeparator} />

      {/* Motivational Quote Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Inspiration</Text>
        </View>
        
        {/* Show card background only when cloud is clicked */}
        {showDailyInspiration ? (
          <View style={styles.quoteSectionCard}>
            <View style={styles.quoteContent}>
              <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
              <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.quoteContent}>
            <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
          </View>
        )}
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
    textAlign: 'center',
  },
  tasksContainer: {
    gap: 12,
    marginTop: 16,
  },
  taskCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
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
  electricEmoji: {
    fontSize: 24,
    color: '#FFD700', // Gold color for the lightning
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
    fontSize: 17,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    letterSpacing: 0.2,
    lineHeight: 24,
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
    textAlign: 'center',
  },
  appointmentsContainer: {
    gap: 12,
    marginTop: 16,
  },
  appointmentCard: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 6,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
    marginHorizontal: -12, // Make it much wider
    height: 45, // Fixed height to make it very thin
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
    fontSize: 17,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  appointmentTime: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  appointmentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: colors.cardBackground,
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
  // Progress Today section styles
  progressContainer: {
    marginVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
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
    textAlign: 'center',
  },
  goalsContainer: {
    gap: 12,
    marginTop: 16,
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
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
  // Stats section styles (removed - using new clean design)
  // Tomorrow section styles (removed - using new clean design)
  // Quote section styles (removed - using new clean design)
  // Activity section styles (removed - using new clean design)
  // New Clean Section Design Styles
  headerContainer: {
    marginBottom: 16,
    paddingVertical: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: 'GreatVibes_400Regular',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: 0.5,
    width: '100%',
  },
  dateText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  cloudLineContainer: {
    position: 'relative',
    marginBottom: 4,
    minHeight: 30,
  },
  quickThoughtCloud: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'absolute',
    right: 8,
    top: -65,
    zIndex: 1,
  },
  tutorialContainer: {
    position: 'absolute',
    right: 55,
    top: -55,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  tutorialArrow: {
    fontSize: 24,
    color: colors.primary,
    marginLeft: 8,
  },
  tutorialText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  pinkLineSeparator: {
    height: 2,
    backgroundColor: colors.primary, // Pink color
    marginVertical: 8,
    marginHorizontal: 8, // Much smaller margins for edge-to-edge
    borderRadius: 1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2, // For Android shadow
    width: '95%',
    alignSelf: 'center',
  },
  quickThoughtButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    minWidth: 80,
    minHeight: 50,
  },
  cloudIcon: {
    fontSize: 36,
  },
  quickThoughtText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  majorSeparator: {
    height: 2,
    backgroundColor: colors.cardBackground,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 1,
  },
  sectionWrapper: {
    marginBottom: 16,
    marginTop: -4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  viewAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  viewAllText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 8,
    borderRadius: 20,
    padding: 20,
    paddingBottom: 60, // Extra padding for add button
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
    position: 'relative',
  },
  quoteSectionCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 8,
    borderRadius: 20,
    padding: 20,
    paddingBottom: 20, // No extra padding needed for quote
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
    position: 'relative',
  },
  contentList: {
    gap: 12,
  },
  contentItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  taskCheckbox: {
    marginRight: 12,
    paddingHorizontal: 4,
  },
  // Additional styles for the new clean design
  goalContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  previewEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  quoteContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flex: 1,
  },
  quoteText: {
    fontSize: 28,
    fontFamily: 'GreatVibes_400Regular',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  quoteAuthor: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'DancingScript_400Regular',
    letterSpacing: 0.3,
  },
  // Add Button Styles - Bottom Right Positioned
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(247, 209, 218, 0.5)',
  },
  addButtonText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
  },
  // Task layout styles (matching TasksScreen)
  dashboardTaskContent: {
    flex: 1,
  },
  dashboardTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardPriorityText: {
    fontSize: 24,
    color: colors.text,
  },
  categoryEmojiBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 28,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 16,
    textAlign: 'center',
  },
});
