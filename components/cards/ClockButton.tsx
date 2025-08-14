import { supabase } from '@/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Props {
  isClockedIn: boolean;
  onStatusChange: () => Promise<void> | void;
  elapsedTime: number;
}

export default function ClockButton({ isClockedIn, onStatusChange, elapsedTime }: Props) {
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('shifts')
        .insert({ start_time: new Date().toISOString() });
      if (error) throw error;
      await onStatusChange();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const { data: current, error: currentError } = await supabase
        .from('current_shift')
        .select('id')
        .maybeSingle();
      if (currentError) throw currentError;
      if (current) {
        const { error } = await supabase
          .from('shifts')
          .update({ end_time: new Date().toISOString() })
          .eq('id', current.id);
        if (error) throw error;
      }
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
          { backgroundColor: isClockedIn ? theme.muted : theme.success },
        ]}
        onPress={handleClockIn}
        disabled={isClockedIn || loading}
      >
        <FontAwesome
          name="play"
          size={18}
          color={isClockedIn ? theme.mutedForeground : theme.primaryForeground}
          style={styles.clockButtonIcon}
        />
        <Text
          style={[
            styles.clockButtonText,
            {
              color: isClockedIn
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

