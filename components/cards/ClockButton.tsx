import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/supabase';
import { roundTime } from '@/utils/timeUtils';
import { FontAwesome } from '@expo/vector-icons';
import { differenceInMinutes, set } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  isClockedIn: boolean;
  onStatusChange: (immediateClockInTime?: number) => Promise<void> | void;
  elapsedTime: number;
  hasShiftToday: boolean;
}

export default function ClockButton({ isClockedIn, onStatusChange, elapsedTime, hasShiftToday }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentShiftId, setCurrentShiftId] = useState<number | null>(null);
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { profile } = useProfile();
  const [clockedInTime, setClockedInTime] = useState('');
  const loadCurrentShift = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Check if there's an active shift for today in past_shifts (this indicates clocked in)
      const { data: activeShift, error } = await supabase
        .from('past_shifts')
        .select('id')
        .eq('user_id', profile?.id)
        .eq('date', today)
        .is('end_time', null)
        .maybeSingle();

      if (error) throw error;
      
      if (activeShift) {
        setCurrentShiftId(activeShift.id);
      }
    } catch (e: any) {
      console.error('Failed to load current shift:', e);
    }
  }, [profile?.id]);

  // Load current shift ID when component mounts if clocked in
  useEffect(() => {
    if (isClockedIn && !currentShiftId) {
      loadCurrentShift();
    }
  }, [isClockedIn, currentShiftId, loadCurrentShift]);

  const handleClockIn = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'User profile not found');
      return;
    }

    if (!hasShiftToday) {
      Alert.alert('No Shift Scheduled', 'You cannot clock in without a scheduled shift for today.');
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    const clockInTimestamp = today.getTime();
    try {
      setLoading(true);

      // Get the existing shift for today
      const { data: existingShift, error: shiftError } = await supabase
        .from('upcoming_shifts')
        .select('id,start_time')
        .eq('user_id', profile.id)
        .eq('date', todayStr)
        .single();

      if (shiftError) throw shiftError;

      //TODO: Extract a method from here
      const start_hours= existingShift.start_time.split(':')[0]
      const start_minutes=existingShift.start_time.split(':')[1]
      const start_date=set(new Date(),{hours:start_hours,minutes:start_minutes,seconds:0})
      
      if (differenceInMinutes(start_date,new Date())>15){
        Alert.alert('Too early!', 'You can only start to clock in 15 minutes before your shift starts.');
        return;
      }
      setClockedInTime(currentTime);
      // Create past_shifts record linked to the upcoming shift
      const { error: pastShiftError } = await supabase
        .from('past_shifts')
        .insert({
          id: existingShift.id,
          user_id: profile.id,
          date: todayStr,
          start_time: currentTime,
        });

      if (pastShiftError) throw pastShiftError;

      setCurrentShiftId(existingShift.id);
      await onStatusChange(clockInTimestamp);
    } catch (e: any) {
      console.error('Failed to clock in:', e);
      Alert.alert('Error', e.message ?? 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!profile?.id || !currentShiftId) {
      Alert.alert('Error', 'No active shift found');
      return;
    }

    const today = new Date();
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;

    try {
      setLoading(true);
      const startTime= roundTime(clockedInTime);
      const endTime=roundTime(currentTime);
      // Update the past_shifts record with end time
      const { error: pastShiftError } = await supabase
        .from('past_shifts')
        .update({ end_time: endTime , start_time:startTime})
        .eq('id', currentShiftId)
        .eq('user_id', profile.id);

      if (pastShiftError) throw pastShiftError;

      setCurrentShiftId(null);
      await onStatusChange();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const confirmClockOut = () => {
    Alert.alert(
      'Clock Out',
      `Stop and submit ${formatDuration(elapsedTime)} of work?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: handleClockOut },
      ],
    );
  };


  return (
    <View style={styles.clockButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.clockButton,
          { backgroundColor: (isClockedIn || !hasShiftToday) ? theme.muted : theme.success },
        ]}
        onPress={handleClockIn}
        disabled={isClockedIn || loading || !hasShiftToday}
      >
        <FontAwesome
          name="play"
          size={18}
          color={(isClockedIn || !hasShiftToday) ? theme.mutedForeground : theme.primaryForeground}
          style={styles.clockButtonIcon}
        />
        <Text
          style={[
            styles.clockButtonText,
            {
              color: (isClockedIn || !hasShiftToday)
                ? theme.mutedForeground
                : theme.primaryForeground,
            },
          ]}
        >
          Clock In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.clockButton,
          { backgroundColor: isClockedIn ? theme.destructive : theme.muted },
        ]}
        onPress={confirmClockOut}
        disabled={!isClockedIn || loading}
      >
        <FontAwesome
          name="stop"
          size={18}
          color={isClockedIn ? theme.primaryForeground : theme.mutedForeground}
          style={styles.clockButtonIcon}
        />
        <Text
          style={[
            styles.clockButtonText,
            {
              color: isClockedIn
                ? theme.primaryForeground
                : theme.mutedForeground,
            },
          ]}
        >
          Clock Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  clockButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  clockButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  clockButtonIcon: {
    marginBottom: 8,
  },
  clockButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

