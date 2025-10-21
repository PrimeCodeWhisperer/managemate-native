import ShiftCard from '@/components/cards/ShiftCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useShifts } from '@/hooks/useShifts';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Button, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function OpenShiftsScreen() {
  const { shifts, loading, error, refresh } = useShifts('open');
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [refreshing, setRefreshing] = useState(false);

  const futureShifts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (shifts || []).filter((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }, [shifts]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Failed to refresh open shifts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.foreground }]}>{error}</Text>
            <Button title="Retry" onPress={refresh} />
          </View>
        ) : futureShifts.length > 0 ? (
          futureShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} onPickUp={refresh} />)
        ) : (
          <Text style={[styles.emptyText, { color: theme.icon }]}>No open shifts</Text>
        )}
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  errorText: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
});
