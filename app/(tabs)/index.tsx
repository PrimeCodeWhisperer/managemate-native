import { supabase } from '@/supabase';
import ClockButton from '@/components/ClockButton';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  role?: string;
  urgent?: boolean;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

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
    try {
      const { data, error } = await supabase.from('upcoming_shifts').select('*');
      if (error) throw error;
      setShifts((data ?? []) as Shift[]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load shifts');
    } finally {
      setLoadingShifts(false);
    }
  };

  const loadClockStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('current_shift')
        .select('id')
        .maybeSingle();
      if (error) throw error;
      setIsClockedIn(!!data);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load status');
    }
  };

  useEffect(() => {
    loadProfile();
    loadShifts();
    loadClockStatus();
    const channel = supabase
      .channel('shifts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shifts' },
        loadClockStatus
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {getDisplayName()}!</Text>
          <Text style={styles.welcomeSubtitle}>Ready to manage your shifts?</Text>
        </View>

        {/* Time Tracking Section */}
        <View style={styles.clockSection}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Time Tracking</Text>
              <View style={styles.statusContainer}>
                <FontAwesome name="clock-o" size={14} color="#6B7280" style={styles.statusIcon} />
                <Text style={styles.statusText}>
                  {isClockedIn ? 'Clocked in' : 'Not clocked in'}
                </Text>
              </View>
            </View>
            
            <ClockButton
              isClockedIn={isClockedIn}
              onStatusChange={loadClockStatus}
            />
          </View>
        </View>

        {/* Open Shifts Section */}
        <View style={styles.openShiftsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Shifts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.shiftsContainer}>
            {loadingShifts ? (
              <Text>Loading...</Text>
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
          
          <View style={styles.vacationCard}>
            <View style={styles.vacationContent}>
              <FontAwesome name="umbrella" size={48} color="#D1D5DB" style={styles.vacationIcon} />
              <Text style={styles.vacationTitle}>No upcoming vacations</Text>
              <Text style={styles.vacationSubtitle}>Plan your time off and submit vacation requests</Text>
              <TouchableOpacity style={styles.vacationButton}>
                <Text style={styles.vacationButtonText}>Request Vacation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom:84

  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 64, // Space for bottom tab navigation
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  clockSection: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
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
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftInfo: {
    flex: 1,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  urgentBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  pickUpButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickUpButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
  vacationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vacationContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacationIcon: {
    marginBottom: 16,
  },
  vacationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  vacationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  vacationButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  vacationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

function ShiftCard({ shift }: { shift: Shift }) {
  const shiftDate = parseISO(String(shift.date));
  let dateLabel = format(shiftDate, 'MMM d');
  if (isToday(shiftDate)) {
    dateLabel = 'Today';
  } else if (isTomorrow(shiftDate)) {
    dateLabel = 'Tomorrow';
  }

  const start = format(parseISO(`2000-01-01T${shift.start_time}`), 'h:mm a');
  const end = shift.end_time
    ? format(parseISO(`2000-01-01T${shift.end_time}`), 'h:mm a')
    : '';

  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftCardContent}>
        <View style={styles.shiftInfo}>
          <View style={styles.shiftHeader}>
            <Text style={styles.shiftDate}>{dateLabel}</Text>
            {shift.urgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={styles.shiftTitle}>{shift.role || 'Shift'}</Text>
          <Text style={styles.shiftTime}>
            {start}
            {end ? ` - ${end}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.pickUpButton}>
          <Text style={styles.pickUpButtonText}>Pick Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
