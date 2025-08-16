import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedView } from '@/components/ThemedView';
import DayAvailabilityCard from '@/components/cards/DayAvailabilityCard';
import AvailabilityModal from '@/components/forms/AvailabilityModal';
import WeekNavigator from '@/components/navigation/WeekNavigator';
import { Colors } from '@/constants/Colors';
import { DayAvailability, useAvailability } from '@/hooks/useAvailability';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { addDays, formatISO } from 'date-fns';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AvailabilityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = insets.bottom + tabBarHeight;
  const topPadding = insets.top;
  
  // Calculate button container height (padding + button height + border)
  const buttonContainerHeight = 12 + 48 + 12 + 1; // paddingVertical(12) + minHeight(48) + paddingVertical(12) + borderTopWidth(1)
  const scrollBottomMargin = buttonContainerHeight + tabBarHeight;

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
    } catch {
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
      <ThemedView style={[styles.container]}>
        <WeekNavigator
          weekStart={weekStart}
          onNavigate={dir => setWeekStart(d => addDays(d, dir === 'prev' ? -7 : 7))}
          theme={theme}
        />

        <View style={styles.content}>
          <ScrollView
            style={[styles.daysList]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ 
              paddingBottom: scrollBottomMargin + 16, // Extra padding for visual breathing room
            }]}
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

          <View style={[styles.buttonContainer, { backgroundColor: theme.card, bottom: tabBarHeight}]}>
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
                <Text 
                  style={[styles.buttonText, { color: theme.primaryForeground }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                >
                  Submit Availability
                </Text>
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
  content: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',

    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48, // Ensure minimum touch target size
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
    textAlign: 'center',
    flexShrink: 1, // Allow text to shrink if needed
  },
});
