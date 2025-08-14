import { supabase } from '@/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
  role?: string;
}

let profileCache: Profile | null = null;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(profileCache);
  const [loading, setLoading] = useState(!profileCache);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      profileCache = data as Profile;
      setProfile(profileCache);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    profileCache = null;
    load();
  }, [load]);

  useEffect(() => {
    if (!profileCache) {
      load();
    }
  }, [load]);

  return { profile, loading, error, refresh };
}

