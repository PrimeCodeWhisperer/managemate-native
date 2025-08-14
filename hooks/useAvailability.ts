import { supabase } from '@/supabase';
import { addDays, formatISO, startOfWeek } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export interface DayAvailability {
  available: boolean;
  startTime?: string;
  endTime?: string;
}

export function useAvailability() {
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [timeMap, setTimeMap] = useState<Record<string, DayAvailability>>({});
  const [rowId, setRowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userWeekKey = (d: Date) => formatISO(d, { representation: 'date' });

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      if (error && error.code !== 'PGRST116') throw error;
      setRowId((data?.id as number) ?? null);

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
      setError(e.message ?? 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error('Not authenticated');

      const weekKey = userWeekKey(weekStart);
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
  }, [weekStart, timeMap, map, rowId, days]);

  return {
    weekStart,
    setWeekStart,
    map,
    setMap,
    timeMap,
    setTimeMap,
    loading,
    error,
    days,
    save,
    load,
  };
}
