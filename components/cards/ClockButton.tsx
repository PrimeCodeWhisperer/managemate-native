import { supabase } from '@/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  isClockedIn: boolean;
  onStatusChange: () => Promise<void> | void;
}

export default function ClockButton({ isClockedIn, onStatusChange }: Props) {
  const [loading, setLoading] = useState(false);

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

  return (
    <View style={styles.clockButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.clockButton,
          isClockedIn ? styles.clockButtonDisabled : styles.clockInButton,
        ]}
        onPress={handleClockIn}
        disabled={isClockedIn || loading}
      >
        <FontAwesome
          name="play"
          size={18}
          color={isClockedIn ? '#9CA3AF' : 'white'}
          style={styles.clockButtonIcon}
        />
        <Text
          style={[
            styles.clockButtonText,
            isClockedIn
              ? styles.clockButtonTextDisabled
              : styles.clockButtonTextActive,
          ]}
        >
          Clock In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.clockButton,
          isClockedIn ? styles.clockOutButton : styles.clockButtonDisabled,
        ]}
        onPress={handleClockOut}
        disabled={!isClockedIn || loading}
      >
        <FontAwesome
          name="stop"
          size={18}
          color={isClockedIn ? 'white' : '#9CA3AF'}
          style={styles.clockButtonIcon}
        />
        <Text
          style={[
            styles.clockButtonText,
            isClockedIn
              ? styles.clockButtonTextActive
              : styles.clockButtonTextDisabled,
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
  clockInButton: {
    backgroundColor: '#22C55E',
  },
  clockOutButton: {
    backgroundColor: '#EF4444',
  },
  clockButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  clockButtonIcon: {
    marginBottom: 8,
  },
  clockButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clockButtonTextActive: {
    color: '#FFFFFF',
  },
  clockButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

