import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

interface Shift { id: string; date: string; start_time: string; end_time: string; }

export default function TimesheetScreen() {
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
          .from('past_shifts')
          .select('*')
          .order('date', { ascending: false })
          .order('end_time', { ascending: false });
        const { data, error } = user?.id ? await base.eq('user_id', user.id) : await base;
        if (error) throw error;
        setShifts((data ?? []) as Shift[]);
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Failed to load timesheet');
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
              {item.date} · {item.start_time} - {item.end_time}
            </ThemedText>
          </View>
        )}
        ListEmptyComponent={<ThemedText>No completed shifts yet.</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 12, padding: 12 },
});
