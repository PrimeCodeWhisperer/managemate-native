import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { addMonths, format, formatISO, getDay, getDaysInMonth, isSameDay, parseISO, startOfMonth, subMonths } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, View } from 'react-native';
import MonthNavigator from '@/components/navigation/MonthNavigator';
import CalendarGrid from '@/components/navigation/CalendarGrid';
import ShiftDetailCard, { Shift } from '@/components/cards/ShiftDetailCard';
import QuickActionsPanel from '@/components/common/QuickActionsPanel';

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    formatISO(new Date(), { representation: 'date' })
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;

      const base = supabase
        .from('upcoming_shifts')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      const { data, error } = user?.id ? await base.eq('user_id', user.id) : await base;
      if (error) throw error;
      setShifts((data ?? []) as Shift[]);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const monthShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const shiftDate = parseISO(String(shift.date));
      return (
        shiftDate.getMonth() === currentDate.getMonth() &&
        shiftDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [shifts, currentDate]);

  const selectedDayShifts = useMemo(() => {
    const day = parseISO(selectedDate);
    return shifts.filter((s) => isSameDay(parseISO(String(s.date)), day));
  }, [selectedDate, shifts]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);
    const startingDayOfWeek = getDay(firstDayOfMonth);

    const days = [] as {
      day: number;
      date: string;
      isCurrentMonth: boolean;
      hasShift: boolean;
    }[];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        -i
      );
      days.push({
        day: prevDate.getDate(),
        date: formatISO(prevDate, { representation: 'date' }),
        isCurrentMonth: false,
        hasShift: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = formatISO(date, { representation: 'date' });
      const hasShift = monthShifts.some((shift) => shift.date === dateString);

      days.push({
        day,
        date: dateString,
        isCurrentMonth: true,
        hasShift,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
      days.push({
        day,
        date: formatISO(nextDate, { representation: 'date' }),
        isCurrentMonth: false,
        hasShift: false,
      });
    }

    return days;
  }, [currentDate, monthShifts]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
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
            <Button title="Retry" onPress={loadShifts} />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <MonthNavigator
            currentDate={currentDate}
            shiftCount={monthShifts.length}
            onNavigate={navigateMonth}
            theme={theme}
          />
          <CalendarGrid
            days={calendarDays}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            theme={theme}
          />
          {selectedDayShifts.length > 0 ? (
            <View style={styles.shiftInfoContainer}>
              {selectedDayShifts.map((shift) => (
                <ShiftDetailCard
                  key={shift.id}
                  shift={shift}
                  selectedDate={selectedDate}
                  theme={theme}
                />
              ))}
            </View>
          ) : (
            <View style={styles.noShiftsContainer}>
              <ThemedText style={[styles.noShiftsText, { color: theme.icon }]}> 
                No shifts scheduled for {format(parseISO(selectedDate), 'MMMM do')}
              </ThemedText>
            </View>
          )}
          <QuickActionsPanel theme={theme} />
        </ScrollView>
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 84,
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
  shiftInfoContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  noShiftsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  noShiftsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

