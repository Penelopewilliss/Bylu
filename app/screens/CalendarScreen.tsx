import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView,
  Alert,
  PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import type { CalendarEvent } from '../types';
import NotificationService from '../services/NotificationService';

// Category colors configuration
const getCategoryColors = (colors: any) => ({
  work: colors.primary,
  personal: colors.accent,
  health: colors.lavender,
  learning: colors.peach,
  other: colors.text,
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    marginTop: 0, // Removed margin to bring month navigation to the very top
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: colors.secondaryText,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    margin: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  monthTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    flexDirection: 'row',
  },
  calendarContainer: {
    flex: 1,
    paddingTop: 16, // Increased from 4 to add more space between month navigation and day headers
    paddingBottom: 120, // Add bottom padding to prevent FAB overlap
  },
  calendarScrollContent: {
    alignItems: 'center',
  },
  calendarContent: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  calendarGrid: {
    marginHorizontal: 4, // Reduced from 8 to make calendar grid wider while keeping swipe area contained
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8, // Reduced from 16 to bring calendar closer to headers
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingVertical: 4, // Reduced from 8 to compress headers
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4, // Reduced from 8 to bring weeks closer together
  },
  dayCell: {
    flex: 1,
    height: 60, // Increased from 40 to make cells taller
    margin: 1, // Reduced back to 1 to bring days closer together
    backgroundColor: colors.cardBackground,
    borderRadius: 8, // Slightly larger radius for bigger cells
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6, // Increased padding for better proportions
    paddingHorizontal: 2, // Add horizontal padding
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  todayCell: {
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  otherMonthCell: {
    backgroundColor: colors.border,
  },
  dayNumber: {
    fontSize: 14,    // Reduced from 16 for mobile
    fontWeight: '600',
    color: colors.text,
  },
  todayText: {
    color: '#000000',
    fontWeight: '700',
  },
  otherMonthText: {
    color: colors.textLight,
  },
  eventDots: {
    flexDirection: 'column', // Changed from 'row' to stack lines vertically
    marginTop: 4,
    alignItems: 'stretch', // Make lines stretch full width
    width: '100%',
    paddingHorizontal: 2,
  },
  eventDot: {
    width: '100%', // Make lines full width of cell
    height: 2, // Thin line height
    borderRadius: 1,
    marginVertical: 0.5, // Small vertical spacing between lines
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  moreEvents: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fab: {
    alignSelf: 'center',
    marginTop: 8, // Reduced from 20 to bring closer to calendar
    marginBottom: 12, // Reduced from 20 for less bottom space
    paddingHorizontal: 16, // Reduced from 24 to make narrower
    paddingVertical: 8, // Reduced from 12 to make shorter
    borderRadius: 8, // Reduced from 12 for smaller appearance
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 }, // Reduced shadow
    shadowOpacity: 0.2, // Reduced shadow opacity
    shadowRadius: 4, // Reduced shadow radius
    elevation: 4, // Reduced elevation
  },
  fabText: {
    fontSize: 14, // Reduced from 16 for smaller text
    color: colors.buttonText,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dayModalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalDragHandle: {
    width: 50,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  dayModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  eventsContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dayEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  dayEmptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  dayEmptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayEmptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
  },
  dayModalButtons: {
    flexDirection: 'row',
    paddingBottom: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addAppointmentButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 6,
  },
  addAppointmentButtonText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  closeButtonText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 14,
  },
  addModalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    maxHeight: 400,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Two buttons per row, wider
    minHeight: 40,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  categoryText: {
    fontSize: 12,
    color: '#2C2C2C', // Dark color that works on all category backgrounds
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  addModalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 32, // Extra padding for Android navigation bar
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 16,
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
    fontWeight: '600',
    fontSize: 16,
  },
  timePickerContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  timePicker: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeScrollView: {
    height: 200,
    width: '100%',
    paddingVertical: 10,
  },
  timeScrollContent: {
    paddingVertical: 10,
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: colors.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: colors.buttonText,
    fontWeight: '600',
  },
  selectedDateDisplay: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Duration/End Time styles
  durationContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    padding: 4,
  },
  durationToggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDurationToggle: {
    backgroundColor: colors.primary,
  },
  durationToggleText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedDurationToggleText: {
    color: colors.buttonText,
    fontWeight: '600',
  },
  durationPickerContainer: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedDurationOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedDurationOptionText: {
    color: colors.buttonText,
    fontWeight: '600',
  },
  endTimeContainer: {
    marginBottom: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.cardBackground,
  },
  // Modal improvements
  modalHeader: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 12,
  },
  wholeDayContainer: {
    marginBottom: 16,
  },
  wholeDayToggle: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  selectedWholeDayToggle: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  wholeDayToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  selectedWholeDayToggleText: {
    color: colors.background,
  },
  // Notification Settings Styles
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  toggle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.background,
  },
  notificationTimings: {
    marginTop: 10,
  },
  timingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 10,
  },
  timingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timingChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  timingChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timingChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  timingChipTextSelected: {
    color: colors.background,
  },
});

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const { events, addEvent, deleteEvent } = useApp();
  const { colors, formatTime, isMilitaryTime } = useTheme();
  
  const styles = createStyles(colors);
  
  // Category colors
  const CATEGORY_COLORS = getCategoryColors(colors);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isCreatingFromSpecificDay, setIsCreatingFromSpecificDay] = useState(false);
  
  // Use global events from AppContext
  const allEvents = events;
  
  // Date picker state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Update form date when dropdowns change
  const updateFormDate = (month: number, day: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, date: dateStr }));
  };

  // Sync dropdowns with form date
  const syncDropdownsWithDate = (dateStr: string) => {
    // Parse date string manually to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    setSelectedMonth(month - 1); // Month is 0-indexed
    setSelectedDay(day);
    setSelectedYear(year);
  };
  
  // Time picker state
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>('AM');
  
  // End time picker state (no AM/PM - follows start time format)
  const [selectedEndHour, setSelectedEndHour] = useState(10);
  const [selectedEndMinute, setSelectedEndMinute] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '',
    endTime: '',
    duration: 60, // Default 1 hour in minutes
    useDuration: true, // true for duration, false for end time
    isWholeDay: false, // new whole day option
    category: 'personal' as 'work' | 'personal' | 'health' | 'learning' | 'other',
    notificationTimings: [15, 60] as number[], // Default notification timings (15 mins, 1 hour)
    notificationsEnabled: true // Enable notifications by default
  });

  // PanResponder for calendar month navigation (horizontal swipes)
  const calendarPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false, // Don't capture immediately
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only capture horizontal swipes that are clearly intended for navigation
      const { dx, dy } = gestureState;
      return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5;
    },
    onPanResponderGrant: () => {
      // Gesture started
    },
    onPanResponderMove: () => {
      // Gesture is moving
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Gesture ended - check if it was a significant swipe
      const { dx } = gestureState;
      const swipeThreshold = 60; // Slightly higher threshold
      
      if (Math.abs(dx) > swipeThreshold) {
        if (dx > 0) {
          // Swipe right - go to previous month
          navigateMonth('prev');
        } else {
          // Swipe left - go to next month
          navigateMonth('next');
        }
      }
    },
    onPanResponderTerminate: () => {
      // Gesture was terminated
    },
    onPanResponderTerminationRequest: () => false, // Don't allow termination
  });

  // PanResponder for swipe to close modal (horizontal + vertical down from header area)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Capture gestures that start in the top area (top 200px) or for horizontal swipes
      const { locationY } = evt.nativeEvent;
      return locationY < 200; // Expanded area for easier swipe-to-close
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const { locationY } = evt.nativeEvent;
      
      // For gestures starting in top area, allow vertical down swipes
      if (locationY < 200) {
        return Math.abs(dx) > 15 || (dy > 15 && Math.abs(dy) > Math.abs(dx));
      }
      
      // For other areas, only horizontal swipes
      return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy);
    },
    onPanResponderGrant: () => {
      // Take control of the gesture
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const { locationY } = evt.nativeEvent;
      
      // Close modal for horizontal swipes (any area)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        setShowAddModal(false);
        setShowDayModal(false);
      }
      // Close modal for vertical down swipes from expanded top area (overlaps content)
      else if (locationY < 350 && dy > 60 && Math.abs(dy) > Math.abs(dx)) {
        setShowAddModal(false);
        setShowDayModal(false);
      }
    },
    onPanResponderTerminationRequest: () => false, // Don't allow termination
  });

  // Get calendar grid for current month
  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Create start date for calendar grid (Monday-first week)
    const dayOfWeek = firstDay.getDay();
    // Convert Sunday=0 to Monday=0 system: (dayOfWeek + 6) % 7
    // This makes Monday=0, Tuesday=1, ..., Sunday=6
    const mondayFirstDayOfWeek = (dayOfWeek + 6) % 7;
    const diff = -mondayFirstDayOfWeek; // Go back to Monday
    const startDate = new Date(year, month, 1 + diff);
    
    const calendar = [];
    let currentYear = startDate.getFullYear();
    let currentMonth = startDate.getMonth();
    let currentDay = startDate.getDate();
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        // Create date using explicit year, month, day to avoid timezone issues
        const cellDate = new Date(currentYear, currentMonth, currentDay);
        weekDays.push(cellDate);
        
        // Move to next day
        currentDay++;
        const tempDate = new Date(currentYear, currentMonth, currentDay);
        if (tempDate.getMonth() !== currentMonth) {
          // Month rolled over
          currentMonth++;
          currentDay = 1;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
        }
      }
      calendar.push(weekDays);
      
      // Check if we should stop (after showing some of next month)
      if (currentMonth !== month && currentDay > 7) break;
    }
    
    return calendar;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === targetYear &&
             eventDate.getMonth() === targetMonth &&
             eventDate.getDate() === targetDay;
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle day press
  const handleDayPress = (date: Date) => {
    // Create a new date using the exact components to avoid timezone issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const cleanDate = new Date(year, month, day, 12, 0, 0); // Use noon to avoid DST issues
    
    setSelectedDate(cleanDate);
    setShowDayModal(true);
  };

  // Handle add appointment
  const handleAddAppointment = () => {
    setEditingEvent(null);
    
    // Use local date formatting to avoid timezone issues
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const initialDate = selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date());
    
    setFormData({ 
      title: '', 
      description: '', 
      date: initialDate, 
      time: '', 
      endTime: '',
      duration: 60,
      useDuration: true,
      isWholeDay: false,
      category: 'personal',
      notificationTimings: [15, 60],
      notificationsEnabled: true
    });
    syncDropdownsWithDate(initialDate);
    setShowAddModal(true);
  };

  // Handle edit appointment
  const handleEditAppointment = (event: CalendarEvent) => {
    setIsCreatingFromSpecificDay(false);
    setEditingEvent(event);
    const eventDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const dateStr = eventDate.toISOString().split('T')[0];
    const duration = Math.round((endDate.getTime() - eventDate.getTime()) / (1000 * 60)); // Duration in minutes
    setFormData({
      title: event.title,
      description: event.description || '',
      date: dateStr,
      time: eventDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      duration: duration,
      useDuration: true,
      isWholeDay: false,
      category: event.category as any,
      notificationTimings: [15, 60], // Default for editing
      notificationsEnabled: true
    });
    syncDropdownsWithDate(dateStr);
    setShowAddModal(true);
  };

  // Save appointment
  const saveAppointment = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your appointment');
      return;
    }
    
    if (!formData.date) {
      Alert.alert('Error', 'Please enter a date for your appointment');
      return;
    }
    
    // Parse date manually to avoid timezone issues
    const [year, month, day] = formData.date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day); // month is 0-indexed
    
    let startDate: Date;
    let endDate: Date;
    
    if (formData.isWholeDay) {
      // Whole day appointment: 12:00 AM to 11:59 PM
      startDate = new Date(appointmentDate);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(appointmentDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Regular appointment with specific times
      // Convert time to 24-hour format
      let hour24 = selectedHour;
      if (!isMilitaryTime) {
        // Only convert if we're using 12-hour format
        if (selectedAmPm === 'PM' && selectedHour !== 12) {
          hour24 = selectedHour + 12;
        } else if (selectedAmPm === 'AM' && selectedHour === 12) {
          hour24 = 0;
        }
      }
      // If isMilitaryTime is true, selectedHour is already in 24-hour format (0-23)
      
      startDate = new Date(appointmentDate);
      startDate.setHours(hour24, selectedMinute, 0, 0);
      
      // Calculate end date based on duration or end time
      endDate = new Date(startDate);
      if (formData.useDuration) {
        // Use duration in minutes
        endDate.setTime(startDate.getTime() + (formData.duration * 60 * 1000));
      } else {
        // Use end time picker values (follows start time AM/PM format)
        let endHour24 = selectedEndHour;
        if (!isMilitaryTime) {
          // Convert 12-hour to 24-hour format using start time AM/PM
          if (selectedAmPm === 'PM' && selectedEndHour !== 12) {
            endHour24 = selectedEndHour + 12;
          } else if (selectedAmPm === 'AM' && selectedEndHour === 12) {
            endHour24 = 0;
          }
        }
        
        endDate.setHours(endHour24, selectedEndMinute, 0, 0);
        
        // If end time is before start time, assume it's next day
        if (endDate <= startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
      }
    }

    const eventData = {
      id: editingEvent?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      color: CATEGORY_COLORS[formData.category],
      category: formData.category
    };

    try {
      if (editingEvent) {
        // For editing, delete the old event and add the updated one
        await deleteEvent(editingEvent.id);
        
        // Cancel old notifications
        const notificationService = NotificationService.getInstance();
        await notificationService.cancelAppointmentNotifications(editingEvent.id);
        
        await addEvent(eventData);
        
        // Schedule new notifications with custom timings
        if (formData.notificationsEnabled) {
          await notificationService.scheduleAppointmentNotifications({
            id: eventData.id,
            title: eventData.title,
            datetime: new Date(eventData.startDate),
            description: eventData.description,
          }, formData.notificationTimings);
        }
      } else {
        // Add new event
        await addEvent(eventData);
        
        // Schedule notifications for new appointment with custom timings
        const notificationService = NotificationService.getInstance();
        if (formData.notificationsEnabled) {
          await notificationService.scheduleAppointmentNotifications({
            id: eventData.id,
            title: eventData.title,
            datetime: new Date(eventData.startDate),
            description: eventData.description,
          }, formData.notificationTimings);
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
      return;
    }

    setShowAddModal(false);
    setFormData({ 
      title: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0], 
      time: '', 
      endTime: '',
      duration: 60,
      useDuration: true,
      isWholeDay: false,
      category: 'personal',
      notificationTimings: [15, 60],
      notificationsEnabled: true
    });
    setEditingEvent(null);
  };

  // Delete appointment
  const handleDeleteAppointment = (eventId: string) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            // Cancel notifications first
            const notificationService = NotificationService.getInstance();
            await notificationService.cancelAppointmentNotifications(eventId);
            
            // Then delete the event
            await deleteEvent(eventId);
          } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'Failed to delete event. Please try again.');
          }
        }}
      ]
    );
  };

  const calendar = getCalendarGrid();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthTextContainer}>
          <Text style={styles.monthText}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </View>
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth('prev')}
          >
            <Text style={styles.navButtonText}>‹‹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth('next')}
          >
            <Text style={styles.navButtonText}>››</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <ScrollView 
        style={styles.calendarContainer} 
        contentContainerStyle={styles.calendarScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContent}>
          {/* Calendar Grid with Swipe Navigation */}
          <View style={styles.calendarGrid} {...calendarPanResponder.panHandlers}>
            {/* Day Headers */}
            <View style={styles.dayHeaderRow}>
              {DAYS.map((day, index) => (
                <Text key={index} style={styles.dayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Weeks */}
            {calendar.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                const isToday_ = isToday(date);
                const isCurrentMonth_ = isCurrentMonth(date);
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                  style={[
                    styles.dayCell,
                    isToday_ && styles.todayCell,
                    !isCurrentMonth_ && styles.otherMonthCell
                  ]}
                  onPress={() => handleDayPress(date)}
                >
                  <Text style={[
                    styles.dayNumber,
                    isToday_ && styles.todayText,
                    !isCurrentMonth_ && styles.otherMonthText
                  ]}>
                    {date.getDate()}
                  </Text>
                  
                  {/* Event lines */}
                  <View style={styles.eventDots}>
                    {dayEvents.map((event, index) => (
                      <View
                        key={event.id}
                        style={[
                          styles.eventDot,
                          { backgroundColor: event.color }
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
          </View>
        
        {/* Add Button underneath calendar */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            setIsCreatingFromSpecificDay(false);
            handleAddAppointment();
          }}
        >
          <Text style={styles.fabText}>+ Add Appointment</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Day Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay} {...panResponder.panHandlers}>
          <View style={styles.dayModalContent}>
            {/* Drag handle for swipe-to-close indication */}
            <View style={styles.modalDragHandle} />
            
            <Text style={styles.dayModalTitle}>
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            <ScrollView style={styles.eventsContainer}>
              {selectedDate && getEventsForDate(selectedDate).map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, { borderLeftColor: event.color }]}
                  onPress={() => handleEditAppointment(event)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAppointment(event.id)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.eventTime}>
                    {formatTime(new Date(event.startDate).getHours(), new Date(event.startDate).getMinutes())}
                  </Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                </TouchableOpacity>
              ))}
              
              {selectedDate && getEventsForDate(selectedDate).length === 0 && (
                <View style={styles.dayEmptyState}>
                  <Text style={styles.dayEmptyIcon}>📅</Text>
                  <Text style={styles.dayEmptyText}>No appointments for this day</Text>
                  <Text style={styles.dayEmptySubtext}>Tap + to add an appointment</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.dayModalButtons}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDayModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addAppointmentButton}
                onPress={() => {
                  setShowDayModal(false);
                  setIsCreatingFromSpecificDay(true);
                  const dateStr = selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
                  setFormData({ 
                    title: '', 
                    description: '', 
                    date: dateStr, 
                    time: '', 
                    endTime: '',
                    duration: 60,
                    useDuration: true,
                    isWholeDay: false,
                    category: 'personal',
                    notificationTimings: [15, 60],
                    notificationsEnabled: true
                  });
                  setEditingEvent(null);
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.addAppointmentButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Appointment Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Header area with PanResponder for swipe-to-close */}
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <View style={styles.modalHandle} />
            <Text style={styles.addModalTitle}>
              {editingEvent ? 'Edit Appointment' : 'New Appointment'}
            </Text>
          </View>
          
          {/* Scrollable form area without PanResponder interference */}
          <View style={styles.addModalContent}>
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="What's your appointment?"
                placeholderTextColor={colors.placeholderText}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />
              
              {/* Only show date picker if not creating from specific day */}
              {!isCreatingFromSpecificDay && (
                <>
                  <Text style={styles.label}>Date</Text>
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Month</Text>
                      <ScrollView 
                        style={styles.timeScrollView} 
                        contentContainerStyle={styles.timeScrollContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {MONTHS.map((month, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.timeOption,
                              selectedMonth === index && styles.selectedTimeOption
                            ]}
                            onPress={() => {
                              setSelectedMonth(index);
                              updateFormDate(index, selectedDay, selectedYear);
                            }}
                          >
                            <Text style={[
                              styles.timeOptionText,
                              selectedMonth === index && styles.selectedTimeOptionText
                            ]}>
                              {month.slice(0, 3)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Day</Text>
                      <ScrollView 
                        style={styles.timeScrollView} 
                        contentContainerStyle={styles.timeScrollContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.timeOption,
                              selectedDay === day && styles.selectedTimeOption
                            ]}
                            onPress={() => {
                              setSelectedDay(day);
                              updateFormDate(selectedMonth, day, selectedYear);
                            }}
                          >
                            <Text style={[
                              styles.timeOptionText,
                              selectedDay === day && styles.selectedTimeOptionText
                            ]}>
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Year</Text>
                      <ScrollView 
                        style={styles.timeScrollView} 
                        contentContainerStyle={styles.timeScrollContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <TouchableOpacity
                            key={year}
                            style={[
                              styles.timeOption,
                              selectedYear === year && styles.selectedTimeOption
                            ]}
                            onPress={() => {
                              setSelectedYear(year);
                              updateFormDate(selectedMonth, selectedDay, year);
                            }}
                          >
                            <Text style={[
                              styles.timeOptionText,
                              selectedYear === year && styles.selectedTimeOptionText
                            ]}>
                              {year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </>
              )}
              
              {/* Show selected date when creating from specific day */}
              {isCreatingFromSpecificDay && (
                <>
                  <Text style={styles.label}>Date</Text>
                  <View style={styles.selectedDateDisplay}>
                    <Text style={styles.selectedDateText}>
                      {new Date(formData.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </>
              )}
              
              <Text style={styles.label}>Time</Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.timePicker}>
                  <Text style={styles.timePickerLabel}>Hour</Text>
                  <ScrollView 
                    style={styles.timeScrollView} 
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {(isMilitaryTime 
                      ? Array.from({ length: 24 }, (_, i) => i) 
                      : Array.from({ length: 12 }, (_, i) => i + 1)
                    ).map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeOption,
                          selectedHour === hour && styles.selectedTimeOption
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          selectedHour === hour && styles.selectedTimeOptionText
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.timePicker}>
                  <Text style={styles.timePickerLabel}>Minutes</Text>
                  <ScrollView 
                    style={styles.timeScrollView} 
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeOption,
                          selectedMinute === minute && styles.selectedTimeOption
                        ]}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          selectedMinute === minute && styles.selectedTimeOptionText
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {!isMilitaryTime && (
                  <View style={styles.timePicker}>
                    <Text style={styles.timePickerLabel}>AM/PM</Text>
                    <ScrollView 
                      style={styles.timeScrollView} 
                      contentContainerStyle={styles.timeScrollContent}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {['AM', 'PM'].map((period) => (
                        <TouchableOpacity
                          key={period}
                          style={[
                            styles.timeOption,
                            selectedAmPm === period && styles.selectedTimeOption
                          ]}
                          onPress={() => setSelectedAmPm(period as 'AM' | 'PM')}
                        >
                          <Text style={[
                            styles.timeOptionText,
                            selectedAmPm === period && styles.selectedTimeOptionText
                          ]}>
                            {period}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              {/* Duration / End Time Section */}
              <Text style={styles.label}>Duration / End Time</Text>
              
              {/* Whole Day Toggle */}
              <View style={styles.wholeDayContainer}>
                <TouchableOpacity
                  style={[
                    styles.wholeDayToggle,
                    formData.isWholeDay && styles.selectedWholeDayToggle
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, isWholeDay: !prev.isWholeDay }))}
                >
                  <Text style={[
                    styles.wholeDayToggleText,
                    formData.isWholeDay && styles.selectedWholeDayToggleText
                  ]}>
                    {formData.isWholeDay ? '✓ Whole Day' : 'Whole Day'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {!formData.isWholeDay && (
              <>
              <View style={styles.durationContainer}>
                <TouchableOpacity
                  style={[
                    styles.durationToggle,
                    formData.useDuration && styles.selectedDurationToggle
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, useDuration: true }))}
                >
                  <Text style={[
                    styles.durationToggleText,
                    formData.useDuration && styles.selectedDurationToggleText
                  ]}>
                    Duration
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.durationToggle,
                    !formData.useDuration && styles.selectedDurationToggle
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, useDuration: false }))}
                >
                  <Text style={[
                    styles.durationToggleText,
                    !formData.useDuration && styles.selectedDurationToggleText
                  ]}>
                    End Time
                  </Text>
                </TouchableOpacity>
              </View>
              
              {formData.useDuration ? (
                <View style={styles.durationPickerContainer}>
                  <Text style={styles.durationLabel}>Duration: {Math.floor(formData.duration / 60)}h {formData.duration % 60}m</Text>
                  <View style={styles.durationOptions}>
                    {[15, 30, 45, 60, 90, 120, 180, 240].map((minutes) => (
                      <TouchableOpacity
                        key={minutes}
                        style={[
                          styles.durationOption,
                          formData.duration === minutes && styles.selectedDurationOption
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, duration: minutes }))}
                      >
                        <Text style={[
                          styles.durationOptionText,
                          formData.duration === minutes && styles.selectedDurationOptionText
                        ]}>
                          {minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ''}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.endTimeContainer}>
                  <Text style={styles.label}>End Time</Text>
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Hour</Text>
                      <ScrollView 
                        style={styles.timeScrollView} 
                        contentContainerStyle={styles.timeScrollContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {(isMilitaryTime ? 
                          Array.from({ length: 24 }, (_, i) => i) : 
                          Array.from({ length: 12 }, (_, i) => i + 1)
                        ).map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={[
                              styles.timeOption,
                              selectedEndHour === hour && styles.selectedTimeOption
                            ]}
                            onPress={() => setSelectedEndHour(hour)}
                          >
                            <Text style={[
                              styles.timeOptionText,
                              selectedEndHour === hour && styles.selectedTimeOptionText
                            ]}>
                              {isMilitaryTime ? String(hour).padStart(2, '0') : hour}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.timePicker}>
                      <Text style={styles.timePickerLabel}>Minute</Text>
                      <ScrollView 
                        style={styles.timeScrollView} 
                        contentContainerStyle={styles.timeScrollContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {[0, 15, 30, 45].map((minute) => (
                          <TouchableOpacity
                            key={minute}
                            style={[
                              styles.timeOption,
                              selectedEndMinute === minute && styles.selectedTimeOption
                            ]}
                            onPress={() => setSelectedEndMinute(minute)}
                          >
                            <Text style={[
                              styles.timeOptionText,
                              selectedEndMinute === minute && styles.selectedTimeOptionText
                            ]}>
                              {String(minute).padStart(2, '0')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              )}
              </>
              )}
              
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      { backgroundColor: color },
                      formData.category === category && styles.selectedCategory
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category as any }))}
                  >
                    <Text style={styles.categoryText} numberOfLines={1}>
                      {category === 'work' ? '💼 Work' :
                       category === 'personal' ? '💖 Personal' :
                       category === 'health' ? '✨ Health' : '📚 Learning'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any notes..."
                placeholderTextColor={colors.placeholderText}
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              />

              {/* Notification Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔔 Notification Settings</Text>
                
                {/* Enable/Disable Notifications */}
                <View style={styles.notificationToggle}>
                  <Text style={styles.toggleLabel}>Enable notifications for this appointment</Text>
                  <TouchableOpacity
                    style={[styles.toggle, formData.notificationsEnabled && styles.toggleActive]}
                    onPress={() => setFormData(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
                  >
                    <Text style={[styles.toggleText, formData.notificationsEnabled && styles.toggleTextActive]}>
                      {formData.notificationsEnabled ? 'ON' : 'OFF'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Notification Timing Options */}
                {formData.notificationsEnabled && (
                  <View style={styles.notificationTimings}>
                    <Text style={styles.timingTitle}>Remind me:</Text>
                    <View style={styles.timingGrid}>
                      {[
                        { value: 5, label: '5 min' },
                        { value: 15, label: '15 min' },
                        { value: 30, label: '30 min' },
                        { value: 60, label: '1 hour' },
                        { value: 120, label: '2 hours' },
                        { value: 1440, label: '1 day' }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.timingChip,
                            formData.notificationTimings.includes(option.value) && styles.timingChipSelected
                          ]}
                          onPress={() => {
                            const newTimings = formData.notificationTimings.includes(option.value)
                              ? formData.notificationTimings.filter(t => t !== option.value)
                              : [...formData.notificationTimings, option.value].sort((a, b) => a - b);
                            setFormData(prev => ({ ...prev, notificationTimings: newTimings }));
                          }}
                        >
                          <Text style={[
                            styles.timingChipText,
                            formData.notificationTimings.includes(option.value) && styles.timingChipTextSelected
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
            
            {/* Button area outside ScrollView */}
            <View style={styles.addModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveAppointment}
              >
                <Text style={styles.saveButtonText}>
                  {editingEvent ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
