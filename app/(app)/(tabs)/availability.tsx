import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedView } from '@/components/ThemedView';
import DayAvailabilityCard from '@/components/cards/DayAvailabilityCard';
import AvailabilityModal from '@/components/forms/AvailabilityModal';
import WeekNavigator from '@/components/navigation/WeekNavigator';
import { Colors } from '@/constants/Colors';
import { DayAvailability, useAvailability } from '@/hooks/useAvailability';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons'; // NEW for FAB icon
import { addDays, formatISO } from 'date-fns';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AvailabilityScreen() {
  const insets = useSafeAreaInsets(); // NEW
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
    load,
    saveAvailability,
    submitting,
  } = useAvailability();

  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tempAvailability, setTempAvailability] = useState<DayAvailability>({ available: false });
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showSaveConfirmation = () => {
    Alert.alert(
      'Submit Availability',
      'This will save your availability for the selected week.\n\nAre you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: handleSaveAvailability },
      ]
    );
  };

  const handleSaveAvailability = async () => {
    setSupabaseLoading(true);
    try {
      await saveAvailability(true);
    } catch {
      // handled inside saveAvailability
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

    const updatedAvailability: DayAvailability = {
      available: tempAvailability.available,
      timeSlots: tempAvailability.timeSlots || [],
    };

    setMap(prev => ({ ...prev, [dateStr]: updatedAvailability.available }));
    setTimeMap(prev => ({ ...prev, [dateStr]: updatedAvailability }));
    setShowModal(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (error) {
      console.error('Failed to refresh availability:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'right']}>
        <ThemedView style={styles.container}>
          <WeekNavigator
            weekStart={weekStart}
            onNavigate={dir => setWeekStart(d => addDays(d, dir === 'prev' ? -7 : 7))}
            theme={theme}
          />

          <ScrollView
            style={styles.daysList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom*1.7, // Extra space for FAB
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
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

          {/* Modern Floating Action Button */}
          <TouchableOpacity
            style={[
              styles.floatingButton,
              {
                backgroundColor: theme.primary,
                bottom: insets.bottom *2 , // Positioned above tab bar with safe area
                shadowColor: theme.shadow,
              },
              (supabaseLoading || submitting) && styles.disabledButton
            ]}
            onPress={showSaveConfirmation}
            disabled={supabaseLoading || submitting}
            activeOpacity={0.8}
          >
            {(supabaseLoading || submitting) ? (
              <ActivityIndicator color={theme.primaryForeground} size="small" />
            ) : (
              <Ionicons name="checkmark" size={20} color={theme.primaryForeground} />
            )}
          </TouchableOpacity>

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
      </SafeAreaView>
    </ErrorBoundary>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  daysList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Modern Floating Action Button (FAB)
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowOffset: { width: 0, height: 4 }, // iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000, // Ensure it appears above other elements
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Remove old button styles
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
});
