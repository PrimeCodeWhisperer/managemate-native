import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DayAvailabilityCard from '@/components/cards/DayAvailabilityCard';
import AvailabilityModal from '@/components/forms/AvailabilityModal';
import WeekNavigator from '@/components/navigation/WeekNavigator';
import { Colors } from '@/constants/Colors';
import { DayAvailability, useAvailability } from '@/hooks/useAvailability';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addDays, formatISO } from 'date-fns';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
    saveAvailability,
    submitting,
  } = useAvailability();

  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tempAvailability, setTempAvailability] = useState<DayAvailability>({ available: false });
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const showSaveConfirmation = () => {
    Alert.alert(
      'Submit Availability',
      'This will save your availability for the selected week.\n\nAre you sure you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: handleSaveAvailability,
        },
      ]
    );
  };

  const handleSaveAvailability = async () => {
    setSupabaseLoading(true);
    try {
      await saveAvailability(true);
    } catch (error) {
      // Error is already handled in saveAvailability
    } finally {
      setSupabaseLoading(false);
    }
  };

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





    // Create a proper DayAvailability object
    const updatedAvailability: DayAvailability = {
      available: tempAvailability.available,
      timeSlots: tempAvailability.timeSlots || [],
    };



    setMap(prev => ({ ...prev, [dateStr]: updatedAvailability.available }));
    setTimeMap(prev => ({ ...prev, [dateStr]: updatedAvailability }));
    setShowModal(false);
  };

  // Also add debugging to see what data is in timeMap before saving
  const debugTimeMapBeforeSave = () => {

    Object.entries(timeMap).forEach(([dateStr, dayAvail]) => {
      const dayIndex = days.findIndex(day => formatISO(day, { representation: 'date' }) === dateStr);
      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex];

    });

  };

  if (loading || supabaseLoading) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={styles.loadingText}>Loading availability...</ThemedText>
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
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={load}
            >
              <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>Retry</Text>
            </TouchableOpacity>
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

        <View style={styles.content}>
          <ScrollView
            style={styles.daysList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.daysListContent}
          >
            {days.map(day => {
              const dateStr = formatISO(day, { representation: 'date' });
              const availability = timeMap[dateStr] || { available: !!map[dateStr] };

              // Log the availability data to see what we have


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

          <View style={[styles.buttonContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.primary },
                (supabaseLoading || submitting) && styles.disabledButton
              ]}
              onPress={showSaveConfirmation}
              disabled={supabaseLoading || submitting}
            >
              {(supabaseLoading || submitting) ? (
                <ActivityIndicator color={theme.primaryForeground} size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>Submit Availability</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <AvailabilityModal
          visible={showModal}
          selectedDay={selectedDay}
          availability={tempAvailability}
          setAvailability={(newAvailability) => {
          // Log each property to see what the modal is providing
          const modalData = newAvailability as any;





            // Check for any other time-related properties
            Object.keys(modalData).forEach(key => {
              if (key.toLowerCase().includes('time') || key.toLowerCase().includes('slot')) {

              }
            });


            setTempAvailability(newAvailability);
          }}
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
    marginBottom: 84
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  daysList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  daysListContent: {
    paddingBottom: 16,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'column',
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  debugButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
