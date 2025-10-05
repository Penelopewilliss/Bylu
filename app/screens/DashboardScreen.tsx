import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function DashboardScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { colors } = useTheme();
  const { tasks, events, toggleTask } = useApp();
  const styles = createStyles(colors);

  // Get today's tasks and events
  const todayTasks = tasks.filter(task => !task.completed).slice(0, 3);
  const todayEvents = events.slice(0, 2);

  return (
    <ScrollView style={styles.container}>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.filter(t => !t.completed).length}</Text>
          <Text style={styles.statLabel}>Open Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.completed).length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
      </View>

      {/* Today's Tasks Preview */}
      {todayTasks.length > 0 ? (
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionCard}>
            <Text style={styles.tasksSectionTitle}>Today's Tasks</Text>
            <View style={styles.tasksContainer}>
              {todayTasks.map((task, index) => (
                <TouchableOpacity key={task.id} style={styles.taskCard}>
                  <View style={styles.taskContent}>
                    <TouchableOpacity 
                      style={styles.heartCheckbox}
                      onPress={() => toggleTask(task.id)}
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
            <Text style={styles.tasksSectionTitle}>Today's Tasks</Text>
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
          <Text style={styles.cardEmoji}>✓</Text>
          <Text style={styles.cardTitle}>Tasks</Text>
          <Text style={styles.cardSubtitle}>Manage todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate?.('Goals')}>
          <Text style={styles.cardEmoji}>🎯</Text>
          <Text style={styles.cardTitle}>Goals</Text>
          <Text style={styles.cardSubtitle}>Track progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate?.('Workday')}>
          <Text style={styles.cardEmoji}>⚡</Text>
          <Text style={styles.cardTitle}>Workday</Text>
          <Text style={styles.cardSubtitle}>Manage sessions</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
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
    textAlign: 'center',
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
    color: colors.white,
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
});
