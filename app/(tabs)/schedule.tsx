import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { formatISO, isSameDay, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface Shift { id: string; date: string; start_time: string; }

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selected, setSelected] = useState<string>(formatISO(new Date(), { representation: 'date' }));

  useEffect(() => {
    (async () => {
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
        Alert.alert('Error', e.message ?? 'Failed to load shifts');
      }
    })();
  }, []);

  const marked = useMemo(() => {
    const marks: Record<string, any> = {};
    shifts.forEach((s) => {
      const d = String(s.date);
      marks[d] = { ...(marks[d] || {}), marked: true, dotColor: theme.primary };
    });
    marks[selected] = { ...(marks[selected] || {}), selected: true, selectedColor: theme.primary };
    return marks;
  }, [shifts, selected, theme.primary]);

  const dayShifts = useMemo(() => {
    const day = parseISO(selected);
    return shifts.filter((s) => isSameDay(parseISO(String(s.date)), day));
  }, [selected, shifts]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
      <Calendar
        onDayPress={(day: any) => setSelected(day.dateString)}
        markedDates={marked}
        theme={{
          calendarBackground: theme.background,
          dayTextColor: theme.foreground,
          monthTextColor: theme.foreground,
          textDisabledColor: '#9CA3AF',
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: theme.primaryForeground,
          todayTextColor: theme.primary,
          arrowColor: theme.foreground,
        }}
      />

      <View style={{ height: 12 }} />

      {dayShifts.length === 0 ? (
        <ThemedText>No shifts for this day.</ThemedText>
      ) : (
        dayShifts.map((s) => (
          <View key={s.id} style={[styles.card, { backgroundColor: theme.secondary }]}> 
            <ThemedText type="subtitle">Shift</ThemedText>
            <ThemedText>
              {String(s.date)} · {s.start_time}
            </ThemedText>
          </View>
        ))
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 12, padding: 12, marginBottom: 8 },
});
