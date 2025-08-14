import ErrorBoundary from '@/components/ErrorBoundary';
import WelcomeSection from '@/components/common/WelcomeSection';
import TimeTrackingCard from '@/components/cards/TimeTrackingCard';
import ShiftCard, { Shift } from '@/components/cards/ShiftCard';
import VacationCard from '@/components/cards/VacationCard';
import { supabase } from '@/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pastShiftId, setPastShiftId]=useState();
  const loadProfile = async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      const { data: profileRes, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileErr) throw profileErr;
      setProfile(profileRes);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load');
    }
  };

  const loadShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('upcoming_shifts').select('*');
      if (error) throw error;
      setShifts((data ?? []) as Shift[]);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const loadClockStatus = async () => {
    try {
      const today = new Date()
      const timestring = today.getHours().toString() + ":" + today.getHours().toString()
      if (!isClockedIn) {
        const { data,error } = await supabase
          .from('past_shifts')
          .insert({ user_id: profile?.id, start_time: timestring })
          .select()
          .single();
        if (error) throw error;
        setPastShiftId(data.id)
      } else {
        const { error } = await supabase
          .from('past_shifts')
          .upsert({ end_time: timestring })
          .eq("id",pastShiftId);
        if (error) throw error;

      }
      setIsClockedIn(!isClockedIn);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load status');
    }
  };

  useEffect(() => {
    loadProfile();
    loadShifts();
  }, []);

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

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <WelcomeSection displayName={getDisplayName()} />

        {/* Time Tracking Section */}
        <TimeTrackingCard
          isClockedIn={isClockedIn}
          onStatusChange={loadClockStatus}
        />

        {/* Open Shifts Section */}
        <View style={styles.openShiftsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Shifts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shiftsContainer}>
            {loading ? (
              <ActivityIndicator />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry" onPress={loadShifts} />
              </View>
            ) : shifts.length > 0 ? (
              shifts.map((shift) => <ShiftCard key={shift.id} shift={shift} />)
            ) : (
              <EmptyShifts />
            )}
          </View>
        </View>

        {/* Vacations Section */}
        <View style={styles.vacationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vacations</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>Request</Text>
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
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
    color: '#000000',
  },
  emptyShifts: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyShiftsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  emptyShiftsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  vacationsSection: {
    marginBottom: 16,
  },
});

function EmptyShifts() {
  return (
    <View style={styles.emptyShifts}>
      <Text style={styles.emptyShiftsTitle}>No open shifts</Text>
      <Text style={styles.emptyShiftsSubtitle}>
        {"You're all caught up for now"}
      </Text>
    </View>
  );
}
