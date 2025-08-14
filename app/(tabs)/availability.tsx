import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { addDays, endOfWeek, format, formatISO, startOfWeek } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function AvailabilityScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [rowId, setRowId] = useState<number | null>(null);

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
      setMap((data?.availability as Record<string, boolean>) ?? {});
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load availability');
    }
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const toggle = (dateStr: string) => {
    setMap((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const save = async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error('Not authenticated');

      const weekKey = userWeekKey(weekStart);
      const availability = days.reduce((acc, d) => {
        const key = formatISO(d, { representation: 'date' });
        acc[key] = !!map[key];
        return acc;
      }, {} as Record<string, boolean>);

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

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.headerRow}>
        <Pressable onPress={() => setWeekStart((d) => addDays(d, -7))} style={[styles.navBtn, { borderColor: theme.secondary }]}> 
          <ThemedText>{'<'}</ThemedText>
        </Pressable>
        <ThemedText type="title">{format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d')}</ThemedText>
        <Pressable onPress={() => setWeekStart((d) => addDays(d, 7))} style={[styles.navBtn, { borderColor: theme.secondary }]}> 
          <ThemedText>{'>'}</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ gap: 8 }}>
        {days.map((d) => {
          const ds = formatISO(d, { representation: 'date' });
          const on = !!map[ds];
          return (
            <Pressable key={ds} onPress={() => toggle(ds)} style={[styles.row, { borderColor: theme.secondary, backgroundColor: on ? theme.primary : 'transparent' }]}> 
              <ThemedText style={{ color: on ? theme.primaryForeground : theme.foreground }}>{format(d, 'EEE, MMM d')}</ThemedText>
              <ThemedText style={{ color: on ? theme.primaryForeground : theme.foreground }}>{on ? 'Available' : 'Unavailable'}</ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: theme.primary }]}> 
        <ThemedText style={{ color: theme.primaryForeground, textAlign: 'center', fontWeight: '600' }}>Save</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  row: { padding: 14, borderWidth: 1, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { marginTop: 8, padding: 14, borderRadius: 12 },
});
