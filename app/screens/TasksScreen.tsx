import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Modal, TextInput, Alert, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Category, Priority } from '../types';

const TASK_CATEGORIES: Record<Category, { emoji: string; label: string; color: string }> = {
  work: { emoji: '💼', label: 'Work', color: '#3F51B5' },
  personal: { emoji: '👤', label: 'Personal', color: '#9C27B0' },
  household: { emoji: '🏠', label: 'Household', color: '#FF9800' },
  groceries: { emoji: '🛒', label: 'Groceries', color: '#4CAF50' },
  calls: { emoji: '📞', label: 'Calls', color: '#2196F3' },
  shopping: { emoji: '🛍️', label: 'Shopping', color: '#E91E63' },
  errands: { emoji: '🚗', label: 'Errands', color: '#9C27B0' },
  finances: { emoji: '💰', label: 'Finances', color: '#795548' },
  health: { emoji: '🏥', label: 'Health', color: '#F44336' },
  fitness: { emoji: '💪', label: 'Fitness', color: '#8BC34A' },
  learning: { emoji: '📚', label: 'Learning', color: '#673AB7' },
  hobbies: { emoji: '🎨', label: 'Hobbies', color: '#009688' },
  other: { emoji: '📝', label: 'Other', color: '#607D8B' },
};

export default function TasksScreen() {
  const { tasks, toggleTask, deleteTask, addTask } = useApp();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal' as Category,
    priority: 'medium' as Priority,
    estimatedTime: 30,
  });

  // PanResponder for swipe to close modal
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const pageY = evt.nativeEvent.pageY;
      const modalTop = 100;
      return pageY < modalTop + 80;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      // Visual feedback could be added here
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 80) {
        setModalVisible(false);
      }
    },
  });

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      estimatedTime: 30,
    });
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title.');
      return;
    }

    try {
      await addTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        category: newTask.category,
        priority: newTask.priority,
        estimatedTime: newTask.estimatedTime,
        microSteps: [],
      });
      
      resetForm();
      setModalVisible(false);
      
      // Auto-select the category if we're not on 'all'
      if (selectedCategory === 'all') {
        setSelectedCategory(newTask.category);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const openAddModal = () => {
    resetForm();
    // If we're on a specific category, pre-select it
    if (selectedCategory !== 'all') {
      setNewTask(prev => ({ ...prev, category: selectedCategory }));
    }
    setModalVisible(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: 'row',
    },
    leftPanel: {
      width: 70,
      backgroundColor: colors.cardBackground,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    categoryWheel: {
      flex: 1,
      paddingVertical: 10,
    },
    rightPanel: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    completedToggle: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedToggleText: {
      fontSize: 12,
      fontWeight: '600',
    },
    categoryTab: {
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      marginVertical: 4,
      borderRadius: 12,
      backgroundColor: 'transparent',
      minHeight: 60,
    },
    selectedCategoryTab: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    categoryEmoji: {
      fontSize: 20,
      marginBottom: 4,
    },
    categoryLabel: {
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 12,
    },
    taskCount: {
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
      marginTop: 2,
      backgroundColor: colors.text,
      opacity: 0.8,
      minWidth: 16,
      alignItems: 'center',
    },
    taskCountText: {
      color: colors.background,
      fontSize: 9,
      fontWeight: 'bold',
    },
    tasksContainer: {
      flex: 1,
    },
    sectionHeader: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    sectionHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: 16,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedTaskItem: {
      opacity: 0.6,
    },
    taskCheckbox: {
      marginRight: 12,
    },
    heartIcon: {
      fontSize: 24,
    },
    taskContent: {
      flex: 1,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    completedTask: {
      textDecorationLine: 'line-through',
      color: colors.placeholderText,
    },
    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginRight: 8,
    },
    priorityText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    categoryTag: {
      fontSize: 12,
      fontWeight: '600',
    },
    deleteButton: {
      padding: 8,
    },
    deleteButtonText: {
      fontSize: 24,
      color: '#ff4757',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: colors.placeholderText,
      textAlign: 'center',
    },
    // Floating Action Button
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    fabText: {
      fontSize: 24,
      color: colors.buttonText,
      fontWeight: 'bold',
    },
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      backgroundColor: colors.cardBackground,
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    pickerContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 2,
      backgroundColor: colors.cardBackground,
      minWidth: 100,
    },
    selectedPickerOption: {
      backgroundColor: colors.primary,
    },
    pickerEmoji: {
      fontSize: 16,
      marginRight: 6,
    },
    pickerLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    priorityContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    priorityOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
    },
    selectedPriorityOption: {
      backgroundColor: colors.primary,
    },
    priorityOptionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    timeButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    timeButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    createButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.text,
    },
    createButtonText: {
      color: colors.buttonText,
    },
  });

  // Filter tasks by category
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  // Separate completed and incomplete tasks
  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);
  
  // Combine tasks based on showCompleted state
  const displayTasks = showCompleted 
    ? [...incompleteTasks, ...completedTasks]
    : incompleteTasks;

  const renderCategoryTab = (category: Category | 'all') => {
    const isSelected = selectedCategory === category;
    const categoryData = category === 'all' 
      ? { emoji: '📋', label: 'All', color: colors.primary }
      : TASK_CATEGORIES[category];
    
    const taskCount = category === 'all' 
      ? tasks.filter(t => !t.completed).length
      : tasks.filter(t => t.category === category && !t.completed).length;

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryTab,
          isSelected && styles.selectedCategoryTab,
        ]}
        onPress={() => setSelectedCategory(category)}
      >
        <Text style={styles.categoryEmoji}>{categoryData.emoji}</Text>
        <Text style={[
          styles.categoryLabel,
          { color: isSelected ? colors.buttonText : colors.text }
        ]} numberOfLines={2}>
          {categoryData.label}
        </Text>
        {taskCount > 0 && (
          <View style={styles.taskCount}>
            <Text style={styles.taskCountText}>{taskCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item, index }: { item: typeof tasks[0], index: number }) => {
    const categoryData = TASK_CATEGORIES[item.category];
    
    // Show section header for completed tasks when both sections are visible
    const isFirstCompletedTask = showCompleted && 
      index === incompleteTasks.length && 
      completedTasks.length > 0;
    
    return (
      <>
        {isFirstCompletedTask && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Completed Tasks</Text>
          </View>
        )}
        <View style={[styles.taskItem, item.completed && styles.completedTaskItem]}>
          <TouchableOpacity 
            style={styles.taskCheckbox}
            onPress={() => toggleTask(item.id)}
          >
            <Text style={styles.heartIcon}>
              {item.completed ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.taskContent}>
            <View style={styles.taskHeader}>
              <Text style={styles.categoryEmoji}>{categoryData.emoji}</Text>
              <Text style={[styles.taskTitle, item.completed && styles.completedTask]}>
                {item.title}
              </Text>
            </View>
            
            <View style={styles.taskMeta}>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: 
                  item.priority === 'high' ? '#ff4757' : 
                  item.priority === 'medium' ? '#ffa502' : '#2ed573'
                }
              ]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
              <Text style={[styles.categoryTag, { color: categoryData.color }]}>
                {categoryData.label}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteTask(item.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Left Category Wheel */}
      <View style={styles.leftPanel}>
        <ScrollView 
          style={styles.categoryWheel}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {renderCategoryTab('all')}
          {Object.keys(TASK_CATEGORIES).map(category => 
            renderCategoryTab(category as Category)
          )}
        </ScrollView>
      </View>

      {/* Right Panel with Tasks */}
      <View style={styles.rightPanel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <TouchableOpacity 
            style={styles.completedToggle}
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Text style={[styles.completedToggleText, { color: colors.text }]}>
              {showCompleted ? 'Hide' : 'Show'} Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <FlatList
          data={displayTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          style={styles.tasksContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>✨</Text>
              <Text style={styles.emptyStateText}>No tasks yet</Text>
              <Text style={styles.emptyStateSubtext}>Create some tasks to get started!</Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={openAddModal}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <Text style={styles.modalTitle}>Add Task</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Task Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Task Title</Text>
              <TextInput
                style={styles.textInput}
                value={newTask.title}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.placeholderText}
                autoFocus
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newTask.description}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
                placeholder="Add more details..."
                placeholderTextColor={colors.placeholderText}
                multiline
              />
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.pickerContainer}>
                {Object.entries(TASK_CATEGORIES).map(([category, data]) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.pickerOption,
                      newTask.category === category && styles.selectedPickerOption,
                      { borderColor: data.color }
                    ]}
                    onPress={() => setNewTask(prev => ({ ...prev, category: category as Category }))}
                  >
                    <Text style={styles.pickerEmoji}>{data.emoji}</Text>
                    <Text style={[
                      styles.pickerLabel,
                      { color: newTask.category === category ? colors.buttonText : colors.text }
                    ]}>
                      {data.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newTask.priority === priority && styles.selectedPriorityOption,
                      { 
                        borderColor: priority === 'high' ? '#ff4757' : 
                                   priority === 'medium' ? '#ffa502' : '#2ed573'
                      }
                    ]}
                    onPress={() => setNewTask(prev => ({ ...prev, priority }))}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      { color: newTask.priority === priority ? colors.buttonText : colors.text }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Estimated Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimated Time (minutes)</Text>
              <View style={styles.timeContainer}>
                {[15, 30, 60, 90, 120].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      newTask.estimatedTime === time && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setNewTask(prev => ({ ...prev, estimatedTime: time }))}
                  >
                    <Text style={[
                      styles.timeButtonText,
                      { color: newTask.estimatedTime === time ? colors.buttonText : colors.text }
                    ]}>
                      {time}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Modal Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateTask}
            >
              <Text style={[styles.buttonText, styles.createButtonText]}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
