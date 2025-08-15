import { supabase } from '@/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Vacation {
  id: string;
  start_date: string;
  end_date: string;
  status?: string;
}

let vacationsCache: Vacation[] | undefined;

export function useVacations() {
  const [vacations, setVacations] = useState<Vacation[]>(vacationsCache ?? []);
  const [loading, setLoading] = useState(!vacationsCache);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('vacations_requests')
        .select('*')
        .eq('employee_id', user.id)
        .order('start_date', { ascending: true });
      if (error) throw error;
      vacationsCache = data ?? [];
      setVacations(vacationsCache);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load vacations');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    vacationsCache = undefined;
    load();
  }, [load]);

  const addVacation = useCallback(
    async (start_date: string, end_date: string) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const { error } = await supabase
        .from('vacations_requests')
        .insert({ employee_id: user.id, start_date, end_date });
      if (error) throw error;
      refresh();
    },
    [refresh]
  );

  useEffect(() => {
    if (!vacationsCache) {
      load();
    }
  }, [load]);

  return { vacations, loading, error, refresh, addVacation };
}

