import { supabase } from '@/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  role?: string;
  status?: string;
  urgent?: boolean;
  user_id?: string; // For upcoming/past shifts
}

export interface OpenShift {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  created_at: string;
}

const shiftsCache: Record<string, (Shift | OpenShift)[] | undefined> = {};

export function useShifts(type: 'upcoming' | 'past' | 'open' = 'upcoming') {
  const cacheKey = type;
  const [shifts, setShifts] = useState<(Shift | OpenShift)[]>(shiftsCache[cacheKey] ?? []);
  const [loading, setLoading] = useState(!shiftsCache[cacheKey]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: any[] = [];
      
      if (type === 'open') {
        // For open shifts, don't filter by user_id since they're available to all
        const { data: openShiftsData, error } = await supabase
          .from('open_shifts')
          .select('*')
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;
        data = openShiftsData ?? [];
      } else {
        // For upcoming/past shifts, filter by user_id
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = userRes.user;

        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        const table = type === 'upcoming' ? 'upcoming_shifts' : 'past_shifts';
        let base = supabase.from(table).select('*').eq('user_id', user.id);

        if (type === 'upcoming') {
          base = base.order('date', { ascending: true }).order('start_time', { ascending: true });
        } else {
          base = base.order('date', { ascending: false }).order('end_time', { ascending: false });
        }
        const { data: shiftsData, error } = await base;
        if (error) throw error;
        data = shiftsData ?? [];
      }

      shiftsCache[cacheKey] = data as (Shift | OpenShift)[];
      setShifts(shiftsCache[cacheKey]!);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, [type, cacheKey]);

  const refresh = useCallback(() => {
    shiftsCache[cacheKey] = undefined;
    load();
  }, [cacheKey, load]);

  useEffect(() => {
    if (!shiftsCache[cacheKey]) {
      load();
    }
  }, [load, cacheKey]);

  return { shifts, loading, error, refresh };
}

export async function pickUpOpenShift(shiftId: string) {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const user = userRes.user;
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data: shift, error: selectErr } = await supabase
    .from('open_shifts')
    .select('date, start_time')
    .eq('id', shiftId)
    .single();
  if (selectErr) throw selectErr;

  const { error: insertErr } = await supabase.from('upcoming_shifts').insert({
    date: shift.date,
    start_time: shift.start_time,
    user_id: user.id,
  });
  if (insertErr) throw insertErr;

  const { error: deleteErr } = await supabase.from('open_shifts').delete().eq('id', shiftId);
  if (deleteErr) throw deleteErr;

  // Clear all caches to force refresh
  invalidateShiftsCache();
  
  // Also emit a custom event to force all components to refresh
  // You could use EventEmitter or a simple callback system here
}

export function invalidateShiftsCache(type?: 'upcoming' | 'past' | 'open') {
  if (type) {
    shiftsCache[type] = undefined;
  } else {
    // Clear all caches
    Object.keys(shiftsCache).forEach(key => {
      shiftsCache[key] = undefined;
    });
  }
}

