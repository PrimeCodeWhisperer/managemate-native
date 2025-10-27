import { supabase } from '@/supabase';
import { add, addDays, formatISO, startOfWeek } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export interface TimeSlot {
  start: string;
  end: string|null;
}

export interface DayAvailability {
  available: boolean;
  timeSlots?: TimeSlot[];
}

interface AvailabilityCacheEntry {
  map: Record<string, boolean>;
  timeMap: Record<string, DayAvailability>;
  rowId: number | null;
}

const availabilityCache: Record<string, AvailabilityCacheEntry | undefined> = {};

export function useAvailability() {
  const [weekStart, setWeekStart] = useState<Date>(
    add(startOfWeek(new Date(), { weekStartsOn: 1 }),{weeks:2})
  );
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [timeMap, setTimeMap] = useState<Record<string, DayAvailability>>({});
  const [rowId, setRowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

      const availability = (data?.availability as Record<string, TimeSlot[]>) ?? {};
      const newMap: Record<string, boolean> = {};
      const newTimeMap: Record<string, DayAvailability> = {};

      

      // Convert day-name based availability to date-based format
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      days.forEach((day, index) => {
        const dateKey = formatISO(day, { representation: 'date' });
        const dayName = dayNames[index];
        const dayTimeSlots = availability[dayName] || [];
        
        const hasAvailability = dayTimeSlots.length > 0;
        newMap[dateKey] = hasAvailability;
        newTimeMap[dateKey] = {
          available: hasAvailability,
          timeSlots: dayTimeSlots,
        };
        
        
      });

      
      

      const entry: AvailabilityCacheEntry = {
        map: newMap,
        timeMap: newTimeMap,
        rowId: (data?.id as number) ?? null,
      };
      availabilityCache[weekKey] = entry;
      setRowId(entry.rowId);
      setMap(entry.map);
      setTimeMap(entry.timeMap);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [weekStart, days]);

  useEffect(() => {
    const weekKey = userWeekKey(weekStart);
    const cached = availabilityCache[weekKey];
    if (cached) {
      setRowId(cached.rowId);
      setMap(cached.map);
      setTimeMap(cached.timeMap);
      setLoading(false);
    } else {
      load();
    }
  }, [weekStart, load]);

  const refresh = useCallback(() => {
    const weekKey = userWeekKey(weekStart);
    delete availabilityCache[weekKey];
    load();
  }, [weekStart, load]);

  // Unified save function that handles both operations
  const saveAvailability = useCallback(async (shouldAlert: boolean = true) => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error('Not authenticated');

      const weekKey = userWeekKey(weekStart);
      
      // Convert date-based format back to day-name format for database
      const availability: Record<string, TimeSlot[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      
      
      days.forEach((day, index) => {
        const dateStr = formatISO(day, { representation: 'date' });
        const dayAvailability = timeMap[dateStr];
        const dayName = dayNames[index];
        
        
        
        if (dayAvailability?.available && dayAvailability.timeSlots && dayAvailability.timeSlots.length > 0) {
          availability[dayName] = dayAvailability.timeSlots;
          
        } else {
          availability[dayName] = [];
          
        }
      });

      
      
      // Use delete + insert approach for consistency with Flutter
      await supabase
        .from('availabilities')
        .delete()
        .eq('employee_id', user.id)
        .eq('week_start', weekKey);

      const { data, error } = await supabase
        .from('availabilities')
        .insert({
          employee_id: user.id,
          week_start: weekKey,
          availability: availability,
        })
        .select('id')
        .single();

      if (error) throw error;

      const newRowId = (data?.id as number) ?? null;
      setRowId(newRowId);

      // Update cache
      const cacheEntry: AvailabilityCacheEntry = {
        map: { ...map },
        timeMap: { ...timeMap },
        rowId: newRowId,
      };
      availabilityCache[weekKey] = cacheEntry;

      if (shouldAlert) {
        Alert.alert('Success', 'Availability saved successfully!');
      }

      return true;
    } catch (e: any) {
      console.error('Error saving availability:', e);
      if (shouldAlert) {
        Alert.alert('Error', e.message ?? 'Failed to save availability');
      }
      throw e;
    }
  }, [weekStart, timeMap, map, days]);

  const save = useCallback(() => saveAvailability(true), [saveAvailability]);

  const submitWeekAvailability = useCallback(async (
    weekStartDate: Date, 
    weekAvailability: Record<string, DayAvailability>
  ) => {
    setSubmitting(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error('Not authenticated');

      const weekKey = userWeekKey(weekStartDate);
      
      
      
      
      
      
      // Let's see ALL records for this user first
      const { data: allUserData, error: allError } = await supabase
        .from('availabilities')
        .select('id, week_start, employee_id')
        .eq('employee_id', user.id);
    
      if (allError) {
        console.error('Error getting all user data:', allError);
      } else {
        
      }
      
      // First, let's check what exists before deletion
      const { data: existingData, error: checkError } = await supabase
        .from('availabilities')
        .select('id, week_start')
        .eq('employee_id', user.id)
        .eq('week_start', weekKey);
    
      if (checkError) {
        console.error('Error checking existing data:', checkError);
      } else {
        
      }
    
      // Convert the weekAvailability to day-name format for database
      const availability: Record<string, TimeSlot[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
      
      weekDays.forEach((day, index) => {
        const dateStr = formatISO(day, { representation: 'date' });
        const dayAvailability = weekAvailability[dateStr];
        const dayName = dayNames[index];
        
        if (dayAvailability?.available && dayAvailability.timeSlots && dayAvailability.timeSlots.length > 0) {
          availability[dayName] = dayAvailability.timeSlots;
        } else {
          availability[dayName] = [];
        }
      });

      // Delete existing entry for this week - add count to see how many were deleted
      const { data: deleteData, error: deleteError, count } = await supabase
        .from('availabilities')
        .delete()
        .eq('employee_id', user.id)
        .eq('week_start', weekKey)
        .select('*');

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }
      
      
      
      

      // Insert new availability
      const { data, error } = await supabase
        .from('availabilities')
        .insert({
          employee_id: user.id,
          week_start: weekKey,
          availability: availability,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      
      

      // Update local state if this is the current week
      if (weekKey === userWeekKey(weekStart)) {
        const newMap: Record<string, boolean> = {};
        const newTimeMap: Record<string, DayAvailability> = {};
        
        Object.entries(weekAvailability).forEach(([key, value]) => {
          newMap[key] = value.available;
          newTimeMap[key] = value;
        });

        setMap(newMap);
        setTimeMap(newTimeMap);
        setRowId((data?.id as number) ?? null);

        // Update cache
        const cacheEntry: AvailabilityCacheEntry = {
          map: newMap,
          timeMap: newTimeMap,
          rowId: (data?.id as number) ?? null,
        };
        availabilityCache[weekKey] = cacheEntry;
      }
      
    } catch (error) {
      console.error('Submit week availability error:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [weekStart]); // Remove saveAvailability from dependencies

  return {
    weekStart,
    setWeekStart,
    map,
    setMap,
    timeMap,
    setTimeMap,
    loading,
    submitting,
    error,
    days,
    save,
    load: refresh,
    submitWeekAvailability,
    saveAvailability, // Expose the unified save function
  };
}
