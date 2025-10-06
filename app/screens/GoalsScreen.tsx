import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  PanResponder,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import type { Goal, MicroTask } from '../types';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal, toggleGoalMicroTask } = useApp();
  const styles = createStyles(colors);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    resources: '',
    notes: '',
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [tempMicroTasks, setTempMicroTasks] = useState<MicroTask[]>([]);

  // PanResponder for swipe to close modal (down swipe only, not in input fields)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Only start gesture if it's in the header area (top 80px of modal)
      const { pageY } = evt.nativeEvent;
      const modalTop = 100; // Approximate modal top position
      return pageY < modalTop + 80; // Only allow gestures in header area
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only activate for clear downward swipes
      const { dx, dy } = gestureState;
      return dy > 20 && Math.abs(dx) < Math.abs(dy); // Down swipe with minimal horizontal movement
    },
    onPanResponderGrant: () => {
      // Take control of the gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Close modal only if swiped down more than 80px
      const { dy } = gestureState;
      if (dy > 80) {
        setModalVisible(false);
      }
    },
    onPanResponderTerminationRequest: () => false, // Don't allow termination
  });

  // Calculate progress for a goal
  const calculateProgress = (goal: Goal): number => {
    if (goal.microTasks.length === 0) return 0;
    const completedTasks = goal.microTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goal.microTasks.length) * 100);
  };

  // Toggle micro-task completion
  const toggleMicroTask = (goalId: string, taskId: string) => {
    toggleGoalMicroTask(goalId, taskId);
  };

  // Add micro-task to temp list (during goal creation)
  const addTempMicroTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: MicroTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };
    
    setTempMicroTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };

  // Remove micro-task from temp list
  const removeTempMicroTask = (taskId: string) => {
    setTempMicroTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Add or update goal
  const saveGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (tempMicroTasks.length === 0) {
      Alert.alert('Error', 'Please add at least one strategy task');
      return;
    }

    if (editingGoal) {
      // Update existing goal
      await updateGoal(editingGoal.id, {
        title: newGoal.title,
        microTasks: tempMicroTasks,
        resources: newGoal.resources,
        notes: newGoal.notes,
      });
    } else {
      // Add new goal
      await addGoal({
        title: newGoal.title,
        microTasks: tempMicroTasks,
        resources: newGoal.resources,
        notes: newGoal.notes,
      });
    }

    // Reset form
    setNewGoal({ title: '', resources: '', notes: '' });
    setTempMicroTasks([]);
    setEditingGoal(null);
    setModalVisible(false);
  };

  // Delete goal - use context function
  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goalTitle}"? This will permanently remove the goal and all its progress.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log('Deleting goal:', goalId);
            deleteGoal(goalId);
          }
        }
      ]
    );
  };

  // Open edit modal
  const editGoal = (goal: Goal) => {
    console.log('Edit goal called for:', goal.title);
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      resources: goal.resources,
      notes: goal.notes,
    });
    setTempMicroTasks([...goal.microTasks]);
    setModalVisible(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingGoal(null);
    setNewGoal({ title: '', resources: '', notes: '' });
    setTempMicroTasks([]);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No goals yet!</Text>
          <Text style={styles.emptySubtitle}>
            Start your journey! Tap + to add your first goal and unlock your potential.
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.goalsList} 
          contentContainerStyle={styles.goalsListContent}
          showsVerticalScrollIndicator={false}
        >
          {goals.map((goal) => {
          const progress = calculateProgress(goal);
          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.progressText}>
                    {progress}% • {goal.microTasks.filter(t => t.completed).length}/{goal.microTasks.length} tasks
                  </Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.circularProgress}>
                    <Text style={styles.progressPercentage}>{progress}%</Text>
                  </View>
                </View>
              </View>

              {/* Micro Tasks Preview - Only show incomplete tasks */}
              <View style={styles.tasksPreview}>
                {goal.microTasks.filter(task => !task.completed).map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskRow}
                    onPress={() => toggleMicroTask(goal.id, task.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      task.completed && styles.checkboxCompleted
                    ]}>
                      {task.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.taskText,
                      task.completed && styles.taskTextCompleted
                    ]}>
                      {task.text}
                    </Text>
                  </TouchableOpacity>
                ))}
                {goal.microTasks.filter(task => !task.completed).length === 0 && (
                  <Text style={styles.allCompletedText}>🎉 All tasks completed!</Text>
                )}
              </View>

              {/* Goal Actions - Edit and Delete buttons */}
              <View style={styles.goalActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => editGoal(goal)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGoal(goal.id, goal.title)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        </ScrollView>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <Text style={styles.modalTitle}>
              {editingGoal ? 'Edit Goal' : 'Add Goal'}
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Goal Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goal Title</Text>
              <TextInput
                style={styles.textInput}
                value={newGoal.title}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, title: text }))}
                placeholder="What do you want to achieve?"
                placeholderTextColor={colors.placeholderText}
                multiline={false}
              />
            </View>

            {/* Strategy Plan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Strategy Plan</Text>
              <Text style={styles.sectionSubtitle}>Break it down into micro-tasks</Text>
              
              <View style={styles.addTaskContainer}>
                <TextInput
                  style={styles.taskInput}
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  placeholder="Add a strategy task..."
                  placeholderTextColor={colors.placeholderText}
                  onSubmitEditing={addTempMicroTask}
                />
                <TouchableOpacity
                  style={styles.addTaskButton}
                  onPress={addTempMicroTask}
                >
                  <Text style={styles.addTaskButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {tempMicroTasks.map((task, index) => (
                <View key={task.id} style={styles.taskItem}>
                  <Text style={styles.taskNumber}>{index + 1}.</Text>
                  <Text style={styles.taskItemText}>{task.text}</Text>
                  <TouchableOpacity
                    style={styles.removeTaskButton}
                    onPress={() => removeTempMicroTask(task.id)}
                  >
                    <Text style={styles.removeTaskButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* What I Need */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What I Need</Text>
              <Text style={styles.sectionSubtitle}>Resources, tools, or support</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newGoal.resources}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, resources: text }))}
                placeholder="List what you need to succeed..."
                placeholderTextColor={colors.placeholderText}
                multiline={true}
                numberOfLines={3}
              />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.sectionSubtitle}>Extra thoughts or reminders</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newGoal.notes}
                onChangeText={(text) => setNewGoal(prev => ({ ...prev, notes: text }))}
                placeholder="Any additional notes..."
                placeholderTextColor={colors.placeholderText}
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </ScrollView>
          
          {/* Bottom Button Container */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveGoal}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  goalsListContent: {
    paddingBottom: 120, // Extra space at bottom for comfortable scrolling
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    alignItems: 'center',
  },
  circularProgress: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  tasksPreview: {
    marginBottom: 16,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  allCompletedText: {
    fontSize: 14,
    color: colors.success,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editButton: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  editButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32, // Extra padding for Android navigation bar
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginRight: 8,
    backgroundColor: colors.background,
    color: colors.text,
  },
  addTaskButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondaryText,
    marginRight: 8,
    minWidth: 20,
  },
  taskItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondaryText,
  },
  removeTaskButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeTaskButtonText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});