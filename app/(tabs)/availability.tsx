import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { Ionicons } from '@expo/vector-icons';
import { addDays, endOfWeek, format, formatISO, startOfWeek } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DayAvailability {
  available: boolean;
  startTime?: string;
  endTime?: string;
}

export default function AvailabilityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [timeMap, setTimeMap] = useState<Record<string, DayAvailability>>({});
  const [rowId, setRowId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tempAvailability, setTempAvailability] = useState<DayAvailability>({ available: false });

  const userWeekKey = (d: Date) => formatISO(d, { representation: 'date' });

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const load = useCallback(async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) return;

      const weekKey = userWeekKey(weekStart);
      const { data, error } = await supabase
        .from('availabilities')
        .select('id, availability')
        .eq('employee_id', user.id)
        .eq('week_start', weekKey)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // ignore no rows
      setRowId((data?.id as number) ?? null);
      
      // Handle both old boolean format and new detailed format
      const availability = (data?.availability as Record<string, boolean | DayAvailability>) ?? {};
      const newMap: Record<string, boolean> = {};
      const newTimeMap: Record<string, DayAvailability> = {};
      
      Object.entries(availability).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          newMap[key] = value;
          newTimeMap[key] = { available: value };
        } else {
          newMap[key] = value.available;
          newTimeMap[key] = value;
        }
      });
      
      setMap(newMap);
      setTimeMap(newTimeMap);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load availability');
    }
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const openDayModal = (day: Date) => {
    const dateStr = formatISO(day, { representation: 'date' });
    const dayAvailability = timeMap[dateStr] || { available: false };
    setSelectedDay(day);
    setTempAvailability(dayAvailability);
    setShowModal(true);
  };

  const saveDayAvailability = () => {
    if (!selectedDay) return;
    
    const dateStr = formatISO(selectedDay, { representation: 'date' });
    setMap(prev => ({ ...prev, [dateStr]: tempAvailability.available }));
    setTimeMap(prev => ({ ...prev, [dateStr]: tempAvailability }));
    setShowModal(false);
  };

  const save = async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error('Not authenticated');

      const weekKey = userWeekKey(weekStart);
      // Save the enhanced availability data including time ranges
      const availability = days.reduce((acc, d) => {
        const key = formatISO(d, { representation: 'date' });
        acc[key] = timeMap[key] || { available: !!map[key] };
        return acc;
      }, {} as Record<string, DayAvailability>);

      if (rowId) {
        const { error } = await supabase
          .from('availabilities')
          .update({ availability })
          .eq('id', rowId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('availabilities')
          .insert({ employee_id: user.id, week_start: weekKey, availability })
          .select('id')
          .single();
        if (error) throw error;
        setRowId((data?.id as number) ?? null);
      }

      Alert.alert('Saved', 'Availability updated');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getAvailabilityText = (dateStr: string) => {
    const dayAvailability = timeMap[dateStr];
    if (!dayAvailability?.available) {
      return { text: 'Not available', color: theme.icon };
    }
    if (dayAvailability.startTime && dayAvailability.endTime) {
      return { 
        text: `Available: ${formatTime(dayAvailability.startTime)} - ${formatTime(dayAvailability.endTime)}`, 
        color: '#22c55e' 
      };
    }
    return { text: 'Available', color: '#22c55e' };
  };

  return (
    <ThemedView style={styles.container}>
      {/* Week Navigator */}
      <View style={styles.weekNavigator}>
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: theme.secondary }]}
          onPress={() => setWeekStart((d) => addDays(d, -7))}
        >
          <Ionicons name="chevron-back" size={16} color={theme.foreground} />
        </TouchableOpacity>
        
        <View style={styles.weekInfo}>
          <ThemedText style={styles.weekText}>
            Week of {format(weekStart, 'MMM d')}-{format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'd')}
          </ThemedText>
          <ThemedText style={styles.weekSubtext}>
            Set your availability
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: theme.secondary }]}
          onPress={() => setWeekStart((d) => addDays(d, 7))}
        >
          <Ionicons name="chevron-forward" size={16} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      {/* Days List */}
      <ScrollView 
        style={styles.daysList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.daysListContent}
      >
        {days.map((day) => {
          const dateStr = formatISO(day, { representation: 'date' });
          const availability = getAvailabilityText(dateStr);
          
          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayCard, { backgroundColor: theme.background, borderColor: theme.secondary }]}
              onPress={() => openDayModal(day)}
            >
              <View style={styles.dayCardContent}>
                <View style={styles.dayCardLeft}>
                  <View style={styles.dayDate}>
                    <Text style={[styles.dayAbbrev, { color: theme.icon }]}>
                      {format(day, 'EEE').toUpperCase()}
                    </Text>
                    <ThemedText style={styles.dayNumber}>
                      {format(day, 'd')}
                    </ThemedText>
                  </View>
                  <View style={styles.dayInfo}>
                    <ThemedText style={styles.dayName}>
                      {format(day, 'EEEE')}
                    </ThemedText>
                    <Text style={[styles.availabilityText, { color: availability.color }]}>
                      {availability.text}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.icon} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={save}
        >
          <Text style={[styles.saveButtonText, { color: theme.primaryForeground }]}>
            Save Availability
          </Text>
        </TouchableOpacity>
      </View>

      {/* Availability Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Set Availability</ThemedText>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.secondary }]}
              onPress={() => setShowModal(false)}
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
                    onPress={() => setTempAvailability(prev => ({ ...prev, available: !prev.available }))}
                  >
                    <View style={[
                      styles.checkbox,
                      { borderColor: theme.secondary },
                      tempAvailability.available && { backgroundColor: theme.primary }
                    ]}>
                      {tempAvailability.available && (
                        <Ionicons name="checkmark" size={12} color={theme.primaryForeground} />
                      )}
                    </View>
                    <ThemedText style={styles.toggleLabel}>Available</ThemedText>
                  </TouchableOpacity>
                </View>

                {tempAvailability.available && (
                  <View style={styles.timeInputs}>
                    <View style={styles.timeInputGroup}>
                      <ThemedText style={styles.timeLabel}>Start Time</ThemedText>
                      <TouchableOpacity 
                        style={[styles.timeInput, { borderColor: theme.secondary }]}
                        onPress={() => {
                          // For now, set default times when pressed
                          // You can implement a proper time picker later
                          setTempAvailability(prev => ({
                            ...prev,
                            startTime: prev.startTime || '09:00',
                            endTime: prev.endTime || '17:00'
                          }));
                        }}
                      >
                        <ThemedText>
                          {tempAvailability.startTime ? formatTime(tempAvailability.startTime) : '9:00 AM'}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.timeInputGroup}>
                      <ThemedText style={styles.timeLabel}>End Time</ThemedText>
                      <TouchableOpacity 
                        style={[styles.timeInput, { borderColor: theme.secondary }]}
                        onPress={() => {
                          // For now, set default times when pressed
                          // You can implement a proper time picker later
                          setTempAvailability(prev => ({
                            ...prev,
                            startTime: prev.startTime || '09:00',
                            endTime: prev.endTime || '17:00'
                          }));
                        }}
                      >
                        <ThemedText>
                          {tempAvailability.endTime ? formatTime(tempAvailability.endTime) : '5:00 PM'}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: theme.secondary }]}
              onPress={() => setShowModal(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveModalButton, { backgroundColor: theme.primary }]}
              onPress={saveDayAvailability}
            >
              <Text style={[styles.saveModalButtonText, { color: theme.primaryForeground }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekText: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  daysList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  daysListContent: {
    paddingBottom: 100,
  },
  dayCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayDate: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  dayAbbrev: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
  },
  availabilityText: {
    fontSize: 14,
    marginTop: 2,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
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
  timeInputGroup: {
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
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
