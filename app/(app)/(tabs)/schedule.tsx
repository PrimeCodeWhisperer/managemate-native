import ShiftDetailCard from '@/components/cards/ShiftDetailCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import CalendarGrid from '@/components/navigation/CalendarGrid';
import MonthNavigator from '@/components/navigation/MonthNavigator';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useNativeTabsTopGutter } from '@/hooks/uneNativeTabsTopGutter';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNativeTabsBottomGutter } from '@/hooks/useNativeTabsBottomGutter';
import { useShifts } from '@/hooks/useShifts';
import { useFocusEffect } from '@react-navigation/core';
import { addMonths, format, formatISO, getDay, getDaysInMonth, isSameDay, parseISO, startOfMonth, subMonths } from 'date-fns';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ScheduleScreen() {
  const { topGutter } = useNativeTabsTopGutter({ extra: 16 }); // Extra padding for scroll content
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { shifts, error, refresh } = useShifts('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(formatISO(new Date(), { representation: 'date' }));
  const { bottomGutter } = useNativeTabsBottomGutter({ extra: 20 }); // Extra padding for scroll content

  const monthShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const shiftDate = parseISO(String(shift.date));
      return shiftDate.getMonth() === currentDate.getMonth() && shiftDate.getFullYear() === currentDate.getFullYear();
    });
  }, [shifts, currentDate]);

  const selectedDayShifts = useMemo(() => {
    const day = parseISO(selectedDate);
    return shifts.filter((s) => isSameDay(parseISO(String(s.date)), day));
  }, [selectedDate, shifts]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);
    const startingDayOfWeek = (getDay(firstDayOfMonth) + 6) % 7;
    const days: { day: number; date: string; isCurrentMonth: boolean; hasShift: boolean }[] = [];

    const prevMonth = subMonths(currentDate, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = daysInPrevMonth - startingDayOfWeek + 1 + i;
      const prevDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      days.push({ day: prevDate.getDate(), date: formatISO(prevDate, { representation: 'date' }), isCurrentMonth: false, hasShift: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = formatISO(date, { representation: 'date' });
      const hasShift = monthShifts.some((shift) => shift.date === dateString);
      days.push({ day, date: dateString, isCurrentMonth: true, hasShift });
    }
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({ day, date: formatISO(nextDate, { representation: 'date' }), isCurrentMonth: false, hasShift: false });
    }
    return days;
  }, [currentDate, monthShifts]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => (direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refresh();
      setCurrentDate(new Date());
      setSelectedDate(formatISO(new Date(), { representation: 'date' }));
    } catch (error) {
      console.error('Failed to refresh schedule:', error);
    } finally {
      setRefreshing(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  if (error) {
    return (
      <ErrorBoundary>
        <ThemedView style={[styles.container]}>
          <View style={styles.errorContainer}>
            <ThemedText>{error}</ThemedText>
            <Button title="Retry" onPress={refresh} />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={[{ flex: 1 }, { backgroundColor: theme.background, paddingTop:topGutter }]} edges={['top', 'left', 'right']}>{/* NEW */}
        <ThemedView style={[styles.container]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottomGutter }} // NEW
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <MonthNavigator currentDate={currentDate} shiftCount={monthShifts.length} onNavigate={navigateMonth} theme={theme} />
            <CalendarGrid days={calendarDays} selectedDate={selectedDate} onSelectDate={setSelectedDate} theme={theme} />
            {selectedDayShifts.length > 0 ? (
              <View style={styles.shiftInfoContainer}>
                {selectedDayShifts.map((shift) => (
                  <ShiftDetailCard key={shift.id} shift={shift} selectedDate={selectedDate} theme={theme} />
                ))}
              </View>
            ) : (
              <View style={styles.noShiftsContainer}>
                <ThemedText style={[styles.noShiftsText, { color: theme.icon }]}>
                  No shifts scheduled for {format(parseISO(selectedDate), 'MMMM do')}
                </ThemedText>
              </View>
            )}
            {/* <QuickActionsPanel onRequestShift={() => Alert.alert('Coming Soon', 'Request Shift will be available soon')} onDropShift={() => Alert.alert('Coming Soon', 'Drop shift option will be available soon')} theme={theme} /> */}
          </ScrollView>
        </ThemedView>
      </SafeAreaView>{/* NEW */}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0 }, // top handled via insets
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16 },
  shiftInfoContainer: { paddingHorizontal: 16, marginBottom: 16 },
  noShiftsContainer: { paddingHorizontal: 16, paddingVertical: 32, alignItems: 'center' },
  noShiftsText: { fontSize: 16, textAlign: 'center' },
});
