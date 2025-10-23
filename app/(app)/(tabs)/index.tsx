import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedView } from '@/components/ThemedView';
import ShiftCard from '@/components/cards/ShiftCard';
import TimeTrackingCard from '@/components/cards/TimeTrackingCard';
import VacationCard from '@/components/cards/VacationCard';
import WelcomeSection from '@/components/common/WelcomeSection';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNativeTabsBottomGutter } from '@/hooks/useNativeTabsBottomGutter';
import { useProfile } from '@/hooks/useProfile';
import { useShifts } from '@/hooks/useShifts';
import { supabase } from '@/supabase';
import { useFocusEffect } from '@react-navigation/core';
import { Link } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // NEW

export default function HomeScreen() {
  const insets = useSafeAreaInsets(); // NEW
  const { bottomGutter } = useNativeTabsBottomGutter({ extra: 20 }); // Extra padding for scroll content

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockStart, setClockStart] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { profile } = useProfile();

  const {
    shifts: upcomingShifts,
    loading: upcomingLoading,
    refresh: refreshUpcoming,
  } = useShifts('upcoming');

  const {
    shifts: openShifts,
    loading: openLoading,
    error: openError,
    refresh: refreshOpen,
  } = useShifts('open');

  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const loadClockStatusFromDatabase = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: activeShift, error } = await supabase
        .from('past_shifts')
        .select('start_time, id')
        .eq('user_id', profile.id)
        .eq('date', today)
        .is('end_time', null)
        .maybeSingle();

      if (!error && activeShift) {
        setIsClockedIn(true);
        const [hours, minutes] = activeShift.start_time.split(':').map(Number);
        const todayStart = new Date();
        todayStart.setHours(hours, minutes, 0, 0);
        setClockStart(todayStart.getTime());
      } else {
        setIsClockedIn(false);
        setClockStart(null);
      }
    } catch (e) {
      console.error('Failed to load clock status:');
      setIsClockedIn(false);
      setClockStart(null);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);
  useEffect(() => {
    loadClockStatusFromDatabase();
  }, [loadClockStatusFromDatabase]);

  const handleClockStatusChange = async (immediateClockInTime?: number) => {
    try {
      if (immediateClockInTime) {
        setIsClockedIn(true);
        setClockStart(immediateClockInTime);
      }
    if (!immediateClockInTime) {

      await loadClockStatusFromDatabase();
      refresh();
    }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update clock status');
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
    if (profile?.first_name) return profile.first_name;
    if (profile?.username) return profile.username;
    return 'User';
  };

  const getFutureOpenShifts = () => {
    if (!openShifts) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return openShifts;
  };

  const futureOpenShifts = getFutureOpenShifts();

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshUpcoming(), refreshOpen(), loadClockStatusFromDatabase()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.foreground} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={[{ flex: 1 }, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'right']}>{/* ensures top is below notch/status bar */}
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              // ensure top/bottom content clears status bar + native tab bar
              paddingTop: insets.top,
              paddingBottom: bottomGutter,
            }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          >
            {/* Welcome Section */}
            <WelcomeSection displayName={getDisplayName()} />

            {/* Time Tracking Section */}
            <TimeTrackingCard
              isClockedIn={isClockedIn}
              onStatusChange={handleClockStatusChange}
              startTime={clockStart}
              shifts={upcomingShifts}
              //loading={upcomingLoading}
            />

            {/* Open Shifts Section */}
            <View style={styles.openShiftsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Open Shifts</Text>
                <Link href="/open-shifts" asChild>
                  <TouchableOpacity>
                    <Text style={[styles.viewAllButton, { color: theme.foreground }]}>View All</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <View style={styles.shiftsContainer}>
                {openLoading ? (
                  <ActivityIndicator />
                ) : openError ? (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.foreground }]}>{openError}</Text>
                    <Button title="Retry" onPress={refresh} />
                  </View>
                ) : futureOpenShifts.length > 0 ? (
                  futureOpenShifts.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift} onPickUp={refresh} />
                  ))
                ) : (
                  <EmptyShifts theme={theme} />
                )}
              </View>
            </View>

            {/* Vacations Section */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Vacations</Text>
                <Link href="/vacations" asChild>
                  <TouchableOpacity>
                    <Text style={[styles.viewAllButton, { color: theme.foreground }]}>Request</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <VacationCard />
            </View>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // paddingTop handled by safe-area insets
  scrollView: { flex: 1, paddingHorizontal: 16 },
  openShiftsSection: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  viewAllButton: { fontSize: 14, fontWeight: '500' },
  shiftsContainer: { gap: 12 },
  errorContainer: { alignItems: 'center', gap: 8, padding: 16 },
  errorText: { marginBottom: 8 },
  emptyShifts: { borderWidth: 1, borderRadius: 8, padding: 24, alignItems: 'center' },
  emptyShiftsTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  emptyShiftsSubtitle: { fontSize: 14, textAlign: 'center' },
});

function EmptyShifts({ theme }: { theme: typeof Colors.light }) {
  return (
    <View
      style={[
        styles.emptyShifts,
        { backgroundColor: theme.background, borderColor: theme.secondary },
      ]}
    >
      <Text style={[styles.emptyShiftsTitle, { color: theme.foreground }]}>No open shifts</Text>
      <Text style={[styles.emptyShiftsSubtitle, { color: theme.icon }]}>
        {"You're all caught up for now"}
      </Text>
    </View>
  );
}
