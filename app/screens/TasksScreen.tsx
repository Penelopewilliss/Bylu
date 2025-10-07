import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

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
  const { tasks, toggleTask, deleteTask } = useApp();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const styles = StyleSheet.create({
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
    categoryTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 4,
      borderRadius: 20,
      borderWidth: 2,
      backgroundColor: colors.cardBackground,
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
  });

  // Filter tasks by category
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

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
      >
        {renderCategoryTab('all')}
        {Object.keys(TASK_CATEGORIES).map(category => 
          renderCategoryTab(category as Category)
        )}
      </ScrollView>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks.filter(t => !t.completed)}
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
    </SafeAreaView>
  );
}
