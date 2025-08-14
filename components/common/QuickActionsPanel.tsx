import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  theme: typeof Colors.light;
  onRequestShift?: () => void;
  onDropShift?: () => void;
}

export default function QuickActionsPanel({ theme, onRequestShift, onDropShift }: Props) {
  return (
    <View style={styles.quickActions}>
      <ThemedText style={[styles.quickActionsTitle, { color: theme.icon }]}>Quick Actions</ThemedText>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: theme.secondary }]}
          onPress={onRequestShift}
        >
          <Ionicons name="calendar-outline" size={24} color={theme.foreground} />
          <ThemedText style={styles.quickActionText}>Request Shift</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: theme.secondary }]}
          onPress={onDropShift}
        >
          <Ionicons name="calendar-clear-outline" size={24} color={theme.foreground} />
          <ThemedText style={styles.quickActionText}>Drop Shift</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

