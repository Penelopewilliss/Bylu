import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView,
  SafeAreaView,
  Alert 
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import type { CalendarEvent } from '../types';

// Category colors configuration
const getCategoryColors = (colors: any) => ({
  work: colors.primary,
  personal: colors.accent,
  health: colors.lavender,
  learning: colors.peach,
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    marginTop: 20,
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
    color: colors.text,
    fontWeight: '600',
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
    paddingTop: 36,
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
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingVertical: 8,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    height: 40, // Smaller for more compact calendar
    margin: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 6, // Smaller radius for more compact look
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4, // Reduced padding
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
    color: colors.text,
    fontWeight: '700',
  },
  otherMonthText: {
    color: colors.textLight,
  },
  eventDots: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  eventDot: {
    width: 4,        // Smaller dots for mobile
    height: 4,
    borderRadius: 2,
    marginHorizontal: 0.5,
    marginVertical: 1,
  },
  moreEvents: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Move higher to avoid calendar overlap
    width: 48, // Slightly smaller
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 20, // Smaller to match the smaller FAB
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
  noEvents: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textLight,
    fontStyle: 'italic',
    marginVertical: 40,
  },
  dayModalButtons: {
    flexDirection: 'row',
    paddingBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addAppointmentButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  addAppointmentButtonText: {
    color: colors.buttonText,
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
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
    gap: 8,
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  addModalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
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
});

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const { events } = useApp();
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
  
  // Local events state (since AppContext doesn't have addEvent/deleteEvent)
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  
  // Combined events from AppContext and local state
  const allEvents = [...events, ...localEvents];
  
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
    const date = new Date(dateStr);
    setSelectedMonth(date.getMonth());
    setSelectedDay(date.getDate());
    setSelectedYear(date.getFullYear());
  };
  
  // Time picker state
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>('AM');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '',
    category: 'personal' as 'work' | 'personal' | 'health' | 'learning' | 'other'
  });

  // Get calendar grid for current month
  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Adjust to start on Monday (1) instead of Sunday (0)
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diff);
    
    const calendar = [];
    const current = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      calendar.push(weekDays);
      if (current > lastDay && current.getDay() === 1) break; // Stop on Monday
    }
    
    return calendar;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return allEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === dateStr;
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
    setSelectedDate(date);
    setShowDayModal(true);
  };

  // Handle add appointment
  const handleAddAppointment = () => {
    setEditingEvent(null);
    const initialDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({ 
      title: '', 
      description: '', 
      date: initialDate, 
      time: '', 
      category: 'personal' 
    });
    syncDropdownsWithDate(initialDate);
    setShowAddModal(true);
  };

  // Handle edit appointment
  const handleEditAppointment = (event: CalendarEvent) => {
    setIsCreatingFromSpecificDay(false);
    setEditingEvent(event);
    const eventDate = new Date(event.startDate);
    const dateStr = eventDate.toISOString().split('T')[0];
    setFormData({
      title: event.title,
      description: event.description || '',
      date: dateStr,
      time: eventDate.toTimeString().slice(0, 5),
      category: event.category as any
    });
    syncDropdownsWithDate(dateStr);
    setShowAddModal(true);
  };

  // Save appointment
  const saveAppointment = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your appointment');
      return;
    }
    
    if (!formData.date) {
      Alert.alert('Error', 'Please enter a date for your appointment');
      return;
    }
    
    const appointmentDate = new Date(formData.date);
    
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
    
    const startDate = new Date(appointmentDate);
    startDate.setHours(hour24, selectedMinute, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(hour24 + 1, selectedMinute, 0, 0); // Default 1 hour duration

    const eventData = {
      id: editingEvent?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      color: CATEGORY_COLORS[formData.category],
      category: formData.category
    };

    // Add to local events state
    if (editingEvent) {
      // Update existing event
      setLocalEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? eventData : event
      ));
    } else {
      // Add new event
      setLocalEvents(prev => [...prev, eventData]);
    }

    setShowAddModal(false);
    setFormData({ 
      title: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0], 
      time: '', 
      category: 'personal' 
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
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Remove from local events
          setLocalEvents(prev => prev.filter(event => event.id !== eventId));
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
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth('next')}
          >
            <Text style={styles.navButtonText}>→</Text>
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
                  
                  {/* Event dots */}
                  <View style={styles.eventDots}>
                    {dayEvents.slice(0, 3).map((event, index) => (
                      <View
                        key={event.id}
                        style={[
                          styles.eventDot,
                          { backgroundColor: event.color }
                        ]}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={styles.moreEvents}>+{dayEvents.length - 3}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          setIsCreatingFromSpecificDay(false);
          handleAddAppointment();
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Day Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dayModalContent}>
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
                <Text style={styles.noEvents}>No appointments for this day</Text>
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
                    category: 'personal' 
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
          <View style={styles.addModalContent}>
            <Text style={styles.addModalTitle}>
              {editingEvent ? 'Edit Appointment' : 'New Appointment'}
            </Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="What's your appointment?"
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
                    <Text style={styles.categoryText}>
                      {category === 'work' ? '💼' :
                       category === 'personal' ? '💖' :
                       category === 'health' ? '✨' :
                       category === 'learning' ? '📚' : '📋'}
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any notes..."
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              />
            </ScrollView>
            
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
