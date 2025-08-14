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
}

const shiftsCache: Record<string, Shift[] | undefined> = {};

export function useShifts(type: 'upcoming' | 'past' = 'upcoming') {
  const cacheKey = type;
  const [shifts, setShifts] = useState<Shift[]>(shiftsCache[cacheKey] ?? []);
  const [loading, setLoading] = useState(!shiftsCache[cacheKey]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;

      const table = type === 'upcoming' ? 'upcoming_shifts' : 'past_shifts';
      let base = supabase.from(table).select('*');
      if (type === 'upcoming') {
        base = base.order('date', { ascending: true }).order('start_time', { ascending: true });
      } else {
        base = base.order('date', { ascending: false }).order('end_time', { ascending: false });
      }
      const { data, error } = user?.id ? await base.eq('user_id', user.id) : await base;
      if (error) throw error;
      shiftsCache[cacheKey] = (data ?? []) as Shift[];
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

