import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

interface Shift { id: string; date: string; start_time: string; }

export default function ShiftsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [shifts, setShifts] = useState<Shift[]>([]);

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

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
      <FlatList
        data={shifts}
        keyExtractor={(i) => String(i.id)}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.secondary }]}> 
            <ThemedText type="subtitle">Shift</ThemedText>
            <ThemedText>
              {format(parseISO(item.date), 'PP')} · {item.start_time}
            </ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 12, padding: 12 },
});
