// TasksScreen.tsx - Matching Goals screen design
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Modal,
  ScrollView,
  SafeAreaView,
  Dimensions 
} from 'react-native';
import Fonts from '../constants/fonts';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: Fonts.title?.fontFamily || 'System',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  taskCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  checkedBox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  deleteButton: {
    backgroundColor: colors.peach,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.modalContent,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  priorityContainer: {
    marginBottom: 20,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedPriority: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: colors.border,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  // Missing styles that are used in the component
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  taskTitleCompleted: {
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  taskCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  taskPriority: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  deleteIcon: {
    fontSize: 16,
  },
  progressCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    fontFamily: Fonts.subtitle?.fontFamily || 'System',
  },
  progressStats: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    fontFamily: Fonts.title?.fontFamily || 'System',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.progressBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: Fonts.subtitle?.fontFamily || 'System',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
  priorityButtonTextActive: {
    color: colors.white,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.border,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    fontFamily: Fonts.body?.fontFamily || 'System',
  },
});

export default function TasksScreen() {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const { colors } = useTheme();
  
  const styles = createStyles(colors);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [searchText, setSearchText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;

    addTask({
      title: newTaskText.trim(),
      description: '',
      category: 'other',
      priority: newTaskPriority,
      microSteps: [],
    });
    
    setNewTaskText('');
    setNewTaskPriority('medium');
    setShowAddModal(false);
  };

  // Filter and sort tasks based on search and priority
  const filteredTasks = tasks.filter(task => {
    return task.title.toLowerCase().includes(searchText.toLowerCase());
  }).sort((a, b) => {
    // Sort by priority: high -> medium -> low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  const renderTaskItem = ({ item }: { item: any }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => toggleTask(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
            {item.title}
          </Text>
        </View>
        {item.description && (
          <Text style={styles.taskDescription}>{item.description}</Text>
        )}
        <View style={styles.taskMeta}>
          <Text style={styles.taskCategory}>{item.category}</Text>
          <Text style={styles.taskPriority}>
            {item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢'} {item.priority}
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Progress Today</Text>
        <Text style={styles.progressStats}>
          {completedCount} of {totalCount} completed
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }
            ]} 
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>
              {searchText ? 'Try a different search term' : 'Create your first task to get started!'}
            </Text>
          </View>
        }
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="What would you like to accomplish?"
              placeholderTextColor={colors.textSecondary}
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />
            
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority:</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity
                  style={[styles.priorityButton, newTaskPriority === 'high' && styles.priorityButtonActive]}
                  onPress={() => setNewTaskPriority('high')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.priorityButtonText, newTaskPriority === 'high' && styles.priorityButtonTextActive]}>
                    🔴 High
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.priorityButton, newTaskPriority === 'medium' && styles.priorityButtonActive]}
                  onPress={() => setNewTaskPriority('medium')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.priorityButtonText, newTaskPriority === 'medium' && styles.priorityButtonTextActive]}>
                    🟡 Medium
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.priorityButton, newTaskPriority === 'low' && styles.priorityButtonActive]}
                  onPress={() => setNewTaskPriority('low')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.priorityButtonText, newTaskPriority === 'low' && styles.priorityButtonTextActive]}>
                    🟢 Low
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewTaskText('');
                  setNewTaskPriority('medium');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, !newTaskText.trim() && styles.createButtonDisabled]}
                onPress={handleAddTask}
                activeOpacity={0.7}
                disabled={!newTaskText.trim()}
              >
                <Text style={styles.createButtonText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
