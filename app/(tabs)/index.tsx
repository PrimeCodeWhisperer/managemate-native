import ErrorBoundary from '@/components/ErrorBoundary';
import ShiftCard from '@/components/cards/ShiftCard';
import TimeTrackingCard from '@/components/cards/TimeTrackingCard';
import VacationCard from '@/components/cards/VacationCard';
import WelcomeSection from '@/components/common/WelcomeSection';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/hooks/useProfile';
import { useShifts } from '@/hooks/useShifts';
import { supabase } from '@/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockStart, setClockStart] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useProfile();
  
  // Get both upcoming shifts and open shifts
  const {
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

  // Load clock status from database only
  useEffect(() => {
    loadClockStatusFromDatabase();
  });

  const loadClockStatusFromDatabase = async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: activeShift, error } = await supabase
        .from('past_shifts')
        .select('start_time, shift_id')
        .eq('user_id', profile.id)
        .eq('date', today)
        .is('end_time', null)
        .maybeSingle();

      if (!error && activeShift) {
        // There's an active shift in the database
        setIsClockedIn(true);
        
        // Parse time from database and create timestamp for today
        const [hours, minutes] = activeShift.start_time.split(':').map(Number);
        const todayStart = new Date();
        todayStart.setHours(hours, minutes, 0, 0);
        setClockStart(todayStart.getTime());
      } else {
        // No active shift
        setIsClockedIn(false);
        setClockStart(null);
      }
    } catch (e) {
      console.error('Failed to load clock status:', e);
      setIsClockedIn(false);
      setClockStart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockStatusChange = async () => {
    try {
      // Refresh the clock status from database after any clock operations
      await loadClockStatusFromDatabase();
      
      // Refresh shifts after clocking operations to update the UI
      refresh();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update clock status');
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.username) {
      return profile.username;
    }
    return 'User';
  };

  // Filter open shifts to show only future ones and limit to 3
  const getFutureOpenShifts = () => {
    if (!openShifts) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return openShifts
      .filter(shift => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);
        return shiftDate > today;
      })
      .slice(0, 3);
  };

  const futureOpenShifts = getFutureOpenShifts();

  // Update refresh function to refresh both
  const refresh = () => {
    refreshUpcoming();
    refreshOpen();
  };

  // Show loading while retrieving clock status
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.foreground} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <WelcomeSection displayName={getDisplayName()} />

        {/* Time Tracking Section */}
        <TimeTrackingCard
          isClockedIn={isClockedIn}
          onStatusChange={handleClockStatusChange}
          startTime={clockStart}
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
               futureOpenShifts.map((shift) => <ShiftCard key={shift.id} shift={shift} onPickUp={refresh} />)
            ) : (
              <EmptyShifts theme={theme} />
            )}
          </View>
        </View>

        {/* Vacations Section */}
        <View style={styles.vacationsSection}>
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
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 84

  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 64, // Space for bottom tab navigation
  },
  openShiftsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  shiftsContainer: {
    gap: 12,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  errorText: {
    marginBottom: 8,
  },
  emptyShifts: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyShiftsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyShiftsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  vacationsSection: {
    marginBottom: 16,
  },
});

function EmptyShifts({ theme }: { theme: typeof Colors.light }) {
  return (
    <View style={[styles.emptyShifts, { backgroundColor: theme.background, borderColor: theme.secondary }]}>
      <Text style={[styles.emptyShiftsTitle, { color: theme.foreground }]}>No open shifts</Text>
      <Text style={[styles.emptyShiftsSubtitle, { color: theme.icon }]}> 
        {"You're all caught up for now"}
      </Text>
    </View>
  );
}
