// TasksScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import Colors from '../constants/colors';

export default function TasksScreen() {
  const { tasks } = useApp();

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.taskItem,
              item.completed && { backgroundColor: Colors.success },
            ]}
            onPress={() => {}}
          >
            <Text style={styles.taskTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  taskItem: {
    padding: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskTitle: { fontSize: 16 },
});
