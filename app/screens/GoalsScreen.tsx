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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Types
interface MicroTask {
  id: string;
  text: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  microTasks: MicroTask[];
  resources: string;
  notes: string;
  createdAt: string;
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const [goals, setGoals] = useState<Goal[]>([
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
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    resources: '',
    notes: '',
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [tempMicroTasks, setTempMicroTasks] = useState<MicroTask[]>([]);

  // Calculate progress for a goal
  const calculateProgress = (goal: Goal): number => {
    if (goal.microTasks.length === 0) return 0;
    const completedTasks = goal.microTasks.filter(task => task.completed).length;
    return Math.round((completedTasks / goal.microTasks.length) * 100);
  };

  // Toggle micro-task completion
  const toggleMicroTask = (goalId: string, taskId: string) => {
    setGoals(prev => prev.map(goal =>
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
    ));
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
  const saveGoal = () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (tempMicroTasks.length === 0) {
      Alert.alert('Error', 'Please add at least one strategy task');
      return;
    }

    const goal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: newGoal.title,
      microTasks: tempMicroTasks,
      resources: newGoal.resources,
      notes: newGoal.notes,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
    };

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? goal : g));
    } else {
      setGoals(prev => [...prev, goal]);
    }

    // Reset form
    setNewGoal({ title: '', resources: '', notes: '' });
    setTempMicroTasks([]);
    setEditingGoal(null);
    setModalVisible(false);
  };

  // Delete goal - simplified like TasksScreen
  const deleteGoal = (goalId: string) => {
    console.log('Deleting goal:', goalId);
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
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
      <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
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
                  onPress={() => deleteGoal(goal.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add/Edit Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingGoal ? 'Edit Goal' : 'Add Goal'}
            </Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveGoal}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
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
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </ScrollView>
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
    paddingVertical: 16,
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
    paddingTop: 20,
  },
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
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
    color: colors.text,
    marginRight: 8,
    minWidth: 20,
  },
  taskItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
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