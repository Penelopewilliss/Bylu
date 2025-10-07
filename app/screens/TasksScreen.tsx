import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Modal, TextInput, Alert, PanResponder, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Category, Priority } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CATEGORY_ITEM_WIDTH = 100;
const SPACING = 15;

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
  const [scrollX, setScrollX] = useState(0);
  const categoryScrollRef = useRef<FlatList>(null);
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

  // Create all categories array for infinite scroll
  const allCategories: (Category | 'all')[] = ['all', ...Object.keys(TASK_CATEGORIES) as Category[]];
  
  // Create infinite scroll data by duplicating categories
  const DUPLICATE_COUNT = 3;
  const duplicatedStart = Array(DUPLICATE_COUNT).fill(null).reduce((acc) => [...acc, ...allCategories], [] as (Category | 'all')[]);
  const duplicatedEnd = Array(DUPLICATE_COUNT).fill(null).reduce((acc) => [...acc, ...allCategories], [] as (Category | 'all')[]);
  const infiniteCategories = [...duplicatedStart, ...allCategories, ...duplicatedEnd];
  const startIndex = DUPLICATE_COUNT * allCategories.length;

  // Real-time selection - select when red line touches category edge
  const handleScroll = (event: any) => {
    try {
      const scrollXValue = event.nativeEvent.contentOffset.x;
      if (typeof scrollXValue === 'number' && !isNaN(scrollXValue)) {
        setScrollX(scrollXValue);
        
        // Check which category the red line is currently touching
        const screenCenter = SCREEN_WIDTH / 2;
        const flatListPadding = (SCREEN_WIDTH - CATEGORY_ITEM_WIDTH) / 2;
        
        for (let i = 0; i < infiniteCategories.length; i++) {
          const itemPositionInContent = i * (CATEGORY_ITEM_WIDTH + SPACING);
          const itemLeftEdgeOnScreen = flatListPadding + itemPositionInContent - scrollXValue;
          const itemRightEdgeOnScreen = itemLeftEdgeOnScreen + CATEGORY_ITEM_WIDTH;
          
          // If red line is anywhere within this category, select it immediately
          if (itemLeftEdgeOnScreen <= screenCenter && screenCenter <= itemRightEdgeOnScreen) {
            const category = infiniteCategories[i];
            if (category && category !== selectedCategory) {
              setSelectedCategory(category);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.log('Scroll error:', error);
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    try {
      const offsetX = event.nativeEvent.contentOffset.x;
      
      // Find which category TOUCHES the red center line (edge or center)
      let selectedIndex = -1;
      const screenCenter = SCREEN_WIDTH / 2;
      const flatListPadding = (SCREEN_WIDTH - CATEGORY_ITEM_WIDTH) / 2;
      
      for (let i = 0; i < infiniteCategories.length; i++) {
        const itemPositionInContent = i * (CATEGORY_ITEM_WIDTH + SPACING);
        const itemLeftEdgeOnScreen = flatListPadding + itemPositionInContent - offsetX;
        const itemRightEdgeOnScreen = itemLeftEdgeOnScreen + CATEGORY_ITEM_WIDTH;
        
        // Check if the red line (screenCenter) is anywhere within this item
        if (itemLeftEdgeOnScreen <= screenCenter && screenCenter <= itemRightEdgeOnScreen) {
          selectedIndex = i;
          break; // Found the item that contains the center line
        }
      }
      
      // Select the category that the red line is touching
      if (selectedIndex >= 0 && infiniteCategories[selectedIndex]) {
        setSelectedCategory(infiniteCategories[selectedIndex]);
      }
      
      // Handle infinite scroll position resets
      if (allCategories && allCategories.length > 0 && selectedIndex >= 0) {
        const minSafeIndex = startIndex - allCategories.length;
        const maxSafeIndex = startIndex + allCategories.length * 2;
        
        if (selectedIndex <= minSafeIndex || selectedIndex >= maxSafeIndex) {
          let realIndex = selectedIndex % allCategories.length;
          if (realIndex < 0) realIndex += allCategories.length;
          
          const resetIndex = startIndex + realIndex;
          const resetOffset = resetIndex * (CATEGORY_ITEM_WIDTH + SPACING);
          if (categoryScrollRef.current) {
            categoryScrollRef.current.scrollToOffset({
              offset: resetOffset,
              animated: false,
            });
          }
        }
      }
    } catch (error) {
      console.log('Scroll end error:', error);
    }
  };

  const scrollToCategory = (category: Category | 'all') => {
    const realIndex = allCategories.indexOf(category);
    if (realIndex !== -1 && categoryScrollRef.current) {
      // Gentle scroll to category without fighting user input
      const targetIndex = startIndex + realIndex;
      const offset = targetIndex * (CATEGORY_ITEM_WIDTH + SPACING);
      categoryScrollRef.current.scrollToOffset({
        offset,
        animated: true,
      });
    }
  };

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
      flexDirection: 'column', // Changed to column for top carousel
    },
    leftPanel: {
      width: 70,
      backgroundColor: colors.cardBackground,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    categoryWheel: {
      height: 120, // Increased height for carousel
      paddingVertical: 10,
    },
    categoryWheelContainer: {
      height: 120,
      position: 'relative',
      overflow: 'hidden', // Hide overflow categories
      marginBottom: 10,
    },
    leftGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 60,
      zIndex: 1,
    },
    rightGradient: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 60,
      zIndex: 1,
    },
    tasksPanel: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      paddingTop: 8,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'flex-end',
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
    headerButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    addButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primary,
      minWidth: 40,
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.buttonText,
    },
    categoryTab: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
      marginHorizontal: SPACING / 2,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
      width: CATEGORY_ITEM_WIDTH,
      height: 80,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    selectedCategoryTab: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      borderWidth: 2,
    },
    categoryEmoji: {
      fontSize: 20,
      marginBottom: 3,
    },
    categoryLabel: {
      fontSize: 9,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 10,
      maxWidth: 80,
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

  const renderCategoryTab = (category: Category | 'all', index?: number) => {
    // Safety checks
    if (!category) return null;
    
    const isSelected = selectedCategory === category;
    const categoryData = category === 'all' 
      ? { emoji: '📋', label: 'All', color: colors.primary }
      : TASK_CATEGORIES[category];
    
    // Safety check for category data
    if (!categoryData) return null;
    
    const taskCount = category === 'all' 
      ? tasks.filter(t => !t.completed).length
      : tasks.filter(t => t.category === category && !t.completed).length;

    // CONSISTENT CENTER DETECTION - Same scaling for all categories
    const itemIndex = index !== undefined ? index : 0;
    
    // FlatList has padding that shifts everything
    const flatListPadding = (SCREEN_WIDTH - CATEGORY_ITEM_WIDTH) / 2;
    
    // Item's position within the FlatList content
    const itemPositionInContent = itemIndex * (CATEGORY_ITEM_WIDTH + SPACING);
    
    // Item's actual position on screen (accounting for scroll and padding)
    const itemLeftEdgeOnScreen = flatListPadding + itemPositionInContent - scrollX;
    const itemCenterOnScreen = itemLeftEdgeOnScreen + (CATEGORY_ITEM_WIDTH / 2);
    
    // True screen center
    const screenCenter = SCREEN_WIDTH / 2;
    
    // Distance from screen center - round to avoid floating point issues
    const distanceFromCenter = Math.round(Math.abs(itemCenterOnScreen - screenCenter));
    
    // CONSISTENT scaling - same thresholds for all items
    let scale = 1;
    let opacity = 1;
    
    if (distanceFromCenter <= 10) {
      scale = 1.5;      // EXACTLY center - same for ALL categories
      opacity = 1;
    } else if (distanceFromCenter <= 30) {
      scale = 1.2;      // Very close to center
      opacity = 0.95;
    } else if (distanceFromCenter <= 60) {
      scale = 1.0;      // Near center
      opacity = 0.8;
    } else if (distanceFromCenter <= 120) {
      scale = 0.7;      // Adjacent items
      opacity = 0.6;
    } else {
      scale = 0.4;      // Distant items
      opacity = 0.3;
    }

    return (
      <TouchableOpacity
        key={`${category}-${index}`}
        style={[
          styles.categoryTab,
          isSelected && styles.selectedCategoryTab,
          { 
            borderColor: isSelected ? categoryData.color : 'transparent',
            transform: [{ scale }],
            opacity,
          }
        ]}
        onPress={() => {
          setSelectedCategory(category);
          scrollToCategory(category);
        }}
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
      {/* Category Carousel */}
      <View style={styles.categoryWheelContainer}>
        <FlatList 
          ref={categoryScrollRef}
          data={infiniteCategories}
          horizontal
          style={styles.categoryWheel}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CATEGORY_ITEM_WIDTH) / 2 }}
          decelerationRate={0.95} // Much faster deceleration
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={8} // Faster updates for smoother visual
          removeClippedSubviews={false}
          renderItem={({ item, index }) => renderCategoryTab(item, index)}
          keyExtractor={(item, index) => `${item}-${index}`}
          getItemLayout={(data, index) => ({
            length: CATEGORY_ITEM_WIDTH + SPACING,
            offset: (CATEGORY_ITEM_WIDTH + SPACING) * index,
            index,
          })}
          initialScrollIndex={startIndex}
          // Performance improvements for smooth scrolling
          maxToRenderPerBatch={20}
          windowSize={10}
          initialNumToRender={15}
          updateCellsBatchingPeriod={50}
        />
        
        {/* DEBUG: Center line to see where middle actually is */}
        <View style={{
          position: 'absolute',
          left: SCREEN_WIDTH / 2 - 1,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: 'red',
          opacity: 0.8,
          zIndex: 100,
        }} />
        
        {/* Left Gradient Fade */}
        <LinearGradient
          colors={[colors.background, 'transparent']}
          style={styles.leftGradient}
          pointerEvents="none"
        />
        
        {/* Right Gradient Fade */}
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.rightGradient}
          pointerEvents="none"
        />
      </View>

      {/* Tasks Panel */}
      <View style={styles.tasksPanel}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.completedToggle}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <Text style={[styles.completedToggleText, { color: colors.text }]}>
                {showCompleted ? 'Hide' : 'Show'} Completed
              </Text>
            </TouchableOpacity>
          </View>
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
