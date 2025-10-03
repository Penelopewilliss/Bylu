// CalendarScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function CalendarScreen() {
  const { events } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const eventsForDate = events.filter(event => event.startDate.startsWith(selectedDate));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.dateTitle}>{selectedDate}</Text>
        {eventsForDate.length === 0 && <Text style={styles.noEvents}>No events today</Text>}
        {eventsForDate.map(event => (
          <View key={event.id} style={[styles.eventCard, { backgroundColor: event.color }]}>\n            <Text style={styles.eventTitle}>{event.title}</Text>\n            {event.description && <Text style={styles.eventDescription}>{event.description}</Text>}\n            <Text style={styles.eventTime}>\n              {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}\n            </Text>\n          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { padding: 20 },
  dateTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  noEvents: { fontSize: 16, color: Colors.textLight },
  eventCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  eventDescription: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  eventTime: { fontSize: 12, color: Colors.textLight, marginTop: 6 },
});
