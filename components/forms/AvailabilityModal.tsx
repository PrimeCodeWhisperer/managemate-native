import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TimeInputGroup from './TimeInputGroup';
import { DayAvailability } from '@/hooks/useAvailability';

interface Props {
  visible: boolean;
  selectedDay: Date | null;
  availability: DayAvailability;
  setAvailability: React.Dispatch<React.SetStateAction<DayAvailability>>;
  onClose: () => void;
  onSave: () => void;
  theme: typeof Colors.light;
}

export default function AvailabilityModal({
  visible,
  selectedDay,
  availability,
  setAvailability,
  onClose,
  onSave,
  theme,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <ThemedText style={styles.modalTitle}>Set Availability</ThemedText>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.secondary }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={16} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          {selectedDay && (
            <>
              <ThemedText style={styles.selectedDayText}>
                {format(selectedDay, 'EEEE, MMMM d')}
              </ThemedText>
              <ThemedText style={[styles.modalSubtext, { color: theme.icon }]}>
                Set your available hours for this day
              </ThemedText>

              <View style={styles.availableToggle}>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() =>
                    setAvailability(prev => ({ ...prev, available: !prev.available }))
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: theme.secondary },
                      availability.available && { backgroundColor: theme.primary },
                    ]}
                  >
                    {availability.available && (
                      <Ionicons name="checkmark" size={12} color={theme.primaryForeground} />
                    )}
                  </View>
                  <ThemedText style={styles.toggleLabel}>Available</ThemedText>
                </TouchableOpacity>
              </View>

              {availability.available && (
                <View style={styles.timeInputs}>
                  <TimeInputGroup
                    label="Start Time"
                    time={availability.startTime}
                    placeholder="9:00 AM"
                    onPress={() =>
                      setAvailability(prev => ({
                        ...prev,
                        startTime: prev.startTime || '09:00',
                        endTime: prev.endTime || '17:00',
                      }))
                    }
                    theme={theme}
                  />
                  <TimeInputGroup
                    label="End Time"
                    time={availability.endTime}
                    placeholder="5:00 PM"
                    onPress={() =>
                      setAvailability(prev => ({
                        ...prev,
                        startTime: prev.startTime || '09:00',
                        endTime: prev.endTime || '17:00',
                      }))
                    }
                    theme={theme}
                  />
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.secondary }]}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveModalButton, { backgroundColor: theme.primary }]}
            onPress={onSave}
          >
            <Text style={[styles.saveModalButtonText, { color: theme.primaryForeground }]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  selectedDayText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    marginBottom: 24,
  },
  availableToggle: {
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toggleLabel: {
    fontSize: 14,
  },
  timeInputs: {
    gap: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
