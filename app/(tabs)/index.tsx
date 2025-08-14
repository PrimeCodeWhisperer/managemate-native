import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { format, isToday, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

interface Shift {
  id: string;
  date: string;      // YYYY-MM-DD
  start_time: string; // e.g. "09:00"
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [username, setUsername] = useState<string | null>(null);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      const { data: profileRes, error: profileErr } = await supabase.from("profiles").select("*").eq("id",user.id).single();
      if(profileErr) throw profileErr;
      const profile = profileRes;
      setUsername(profile.username)


      const query = supabase
        .from('upcoming_shifts')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      const { data, error } = user?.id ? await query.eq('user_id', user.id) : await query;
      if (error) throw error;

      const today = (data ?? []).filter((s: any) => isToday(parseISO(String(s.date))));
      setTodayShifts(today as Shift[]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderShift = ({ item }: { item: Shift }) => (
    <View style={[styles.card, { backgroundColor: theme.secondary }]}>
      <ThemedText type="subtitle">Shift</ThemedText>
      <ThemedText>
        {format(parseISO(item.date), 'PP')} · {item.start_time}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>

      <ScrollView>
        <ThemedText type="title">Welcome {username ?? ''}</ThemedText>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>Today&apos;s Shifts</ThemedText>
        <ThemedView>
<FlatList
          data={todayShifts}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderShift}
          ListEmptyComponent={<ThemedText>No shifts today.</ThemedText>}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          contentContainerStyle={{ gap: 12 }}
        />
        </ThemedView>
        
        <View style={styles.spacer} />

        <ThemedText type="subtitle" style={styles.sectionTitle}>Open Shifts</ThemedText>
        <View style={[styles.placeholder, { borderColor: theme.secondary }]}>
          <ThemedText>Coming soon</ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>Vacations</ThemedText>
        <View style={[styles.placeholder, { borderColor: theme.secondary }]}>
          <ThemedText>Coming soon</ThemedText>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  sectionTitle: { marginTop: 8 },
  card: {
    borderRadius: 12,
    padding: 12,
  },
  placeholder: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  spacer: { height: 16 },
});
