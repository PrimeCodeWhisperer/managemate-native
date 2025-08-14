import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DayAvailabilityCard from '@/components/cards/DayAvailabilityCard';
import AvailabilityModal from '@/components/forms/AvailabilityModal';
import WeekNavigator from '@/components/navigation/WeekNavigator';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DayAvailability, useAvailability } from '@/hooks/useAvailability';
import { addDays, formatISO } from 'date-fns';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AvailabilityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const {
    weekStart,
    setWeekStart,
    map,
    setMap,
    timeMap,
    setTimeMap,
    days,
    loading,
    error,
    load,
    save,
  } = useAvailability();
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tempAvailability, setTempAvailability] = useState<DayAvailability>({ available: false });

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

  if (loading) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <ThemedText>{error}</ThemedText>
            <Button title="Retry" onPress={load} />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        <WeekNavigator
          weekStart={weekStart}
          onNavigate={dir => setWeekStart(d => addDays(d, dir === 'prev' ? -7 : 7))}
          theme={theme}
        />

        <ScrollView
          style={styles.daysList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.daysListContent}
        >
          {days.map(day => {
            const dateStr = formatISO(day, { representation: 'date' });
            const availability = timeMap[dateStr] || { available: !!map[dateStr] };
            return (
              <DayAvailabilityCard
                key={dateStr}
                day={day}
                availability={availability}
                onPress={() => openDayModal(day)}
                theme={theme}
              />
            );
          })}
        </ScrollView>

        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={save}
          >
            <Text style={[styles.saveButtonText, { color: theme.primaryForeground }]}>Save Availability</Text>
          </TouchableOpacity>
        </View>

        <AvailabilityModal
          visible={showModal}
          selectedDay={selectedDay}
          availability={tempAvailability}
          setAvailability={setTempAvailability}
          onClose={() => setShowModal(false)}
          onSave={saveDayAvailability}
          theme={theme}
        />
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  daysList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  daysListContent: {
    paddingBottom: 100,
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
});
