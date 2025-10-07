import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
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
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const { colors } = useTheme();
  
  const styles = createStyles(colors);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('other');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // PanResponder for swipe to close modal
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      return Math.abs(dx) > 20 || Math.abs(dy) > 20;
    },
    onPanResponderGrant: () => {},
    onPanResponderMove: (evt, gestureState) => {},
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > 60 || Math.abs(dy) > 60) {
        setShowAddModal(false);
      }
    },
    onPanResponderTerminationRequest: () => false,
  });

  const handleAddTask = async () => {
    if (newTaskText.trim() === '') return;
    
    setIsLoading(true);
    
    try {
      await addTask({
        title: newTaskText.trim(),
        description: '',
        category: newTaskCategory,
        priority: newTaskPriority,
        estimatedTime: 30,
        dueDate: new Date().toISOString(),
        microSteps: []
      });
      
      setNewTaskText('');
      setNewTaskCategory('other');
      setNewTaskPriority('medium');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks by category
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  // Group tasks by category for display
  const tasksByCategory = Object.keys(TASK_CATEGORIES).reduce((acc, category) => {
    const categoryTasks = tasks.filter(task => task.category === category && !task.completed);
    if (categoryTasks.length > 0) {
      acc[category as Category] = categoryTasks;
    }
    return acc;
  }, {} as Record<Category, typeof tasks>);

  const renderCategoryTab = (category: Category | 'all') => {
    const isSelected = selectedCategory === category;
    const categoryData = category === 'all' 
      ? { emoji: '📋', label: 'All Tasks', color: colors.primary }
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
          { borderColor: categoryData.color }
        ]}
        onPress={() => setSelectedCategory(category)}
      >
        <Text style={styles.categoryEmoji}>{categoryData.emoji}</Text>
        <Text style={[
          styles.categoryLabel,
          { color: isSelected ? colors.buttonText : colors.text }
        ]}>
          {categoryData.label}
        </Text>
        {taskCount > 0 && (
          <View style={[styles.taskCount, { backgroundColor: categoryData.color }]}>
            <Text style={styles.taskCountText}>{taskCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }: { item: typeof tasks[0] }) => {
    const categoryData = TASK_CATEGORIES[item.category];
    
    return (
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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {renderCategoryTab('all')}
        {Object.keys(TASK_CATEGORIES).map(category => 
          renderCategoryTab(category as Category)
        )}
      </ScrollView>

      {/* Tasks List or Category Sections */}
      {selectedCategory === 'all' ? (
        // Show all categories with their tasks
        <ScrollView style={styles.tasksContainer}>
          {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
            const categoryData = TASK_CATEGORIES[category as Category];
            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categorySectionHeader}>
                  <Text style={styles.categoryEmoji}>{categoryData.emoji}</Text>
                  <Text style={[styles.categorySectionTitle, { color: categoryData.color }]}>
                    {categoryData.label}
                  </Text>
                  <Text style={styles.taskCount}>({categoryTasks.length})</Text>
                </View>
                
                {categoryTasks.map(task => (
                  <View key={task.id}>
                    {renderTaskItem({ item: task })}
                  </View>
                ))}
              </View>
            );
          })}
          
          {Object.keys(tasksByCategory).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>✨</Text>
              <Text style={styles.emptyStateText}>No tasks yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap + to add your first task</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // Show filtered tasks for selected category
        <FlatList
          data={filteredTasks.filter(t => !t.completed)}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          style={styles.tasksContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>
                {TASK_CATEGORIES[selectedCategory as Category].emoji}
              </Text>
              <Text style={styles.emptyStateText}>
                No {TASK_CATEGORIES[selectedCategory as Category].label.toLowerCase()} tasks
              </Text>
              <Text style={styles.emptyStateSubtext}>Tap + to add a task</Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay} {...panResponder.panHandlers}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.taskInput}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.placeholderText}
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />

            {/* Category Selection */}
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.modalCategoryContainer}
            >
              {Object.entries(TASK_CATEGORIES).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.modalCategoryOption,
                    newTaskCategory === key && styles.selectedModalCategory,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setNewTaskCategory(key as Category)}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={styles.modalCategoryText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Priority Selection */}
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.priorityContainer}>
              {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newTaskPriority === priority && styles.selectedPriority,
                    { backgroundColor: 
                      priority === 'high' ? '#ff4757' : 
                      priority === 'medium' ? '#ffa502' : '#2ed573'
                    }
                  ]}
                  onPress={() => setNewTaskPriority(priority)}
                >
                  <Text style={styles.priorityOptionText}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, { opacity: newTaskText.trim() ? 1 : 0.5 }]}
                onPress={handleAddTask}
                disabled={!newTaskText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.buttonText} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles for the component
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  categoryContainer: {
    maxHeight: 60,
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: colors.surface,
    minWidth: 100,
  },
  selectedCategoryTab: {
    backgroundColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  taskCount: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  taskCountText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tasksContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categorySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    color: colors.error,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  taskInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  modalCategoryContainer: {
    maxHeight: 80,
    marginBottom: 20,
  },
  modalCategoryOption: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: colors.background,
    minWidth: 80,
  },
  selectedModalCategory: {
    backgroundColor: colors.primary,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  selectedPriority: {
    opacity: 1,
  },
  priorityOptionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});