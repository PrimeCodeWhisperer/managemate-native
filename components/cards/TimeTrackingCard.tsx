import ClockButton from '@/components/cards/ClockButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  isClockedIn: boolean;
  onStatusChange: () => Promise<void> | void;
  startTime: number | null;
}

export default function TimeTrackingCard({ isClockedIn, onStatusChange, startTime }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [elapsed, setElapsed] = useState(0);
  const [hasShiftToday, setHasShiftToday] = useState(false);
  const [loadingShift, setLoadingShift] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    let interval: number | undefined;
    
    if (isClockedIn && startTime) {
      const update = () => {
        const now = Date.now();
        const elapsedMs = now - startTime;
        setElapsed(elapsedMs);
      };
      
      // Update immediately
      update();
      
      // Then update every second
      interval = setInterval(update, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isClockedIn, startTime]);

  // Check if there's a shift scheduled for today
  useEffect(() => {
    checkShiftForToday();
  }, [profile?.id, isClockedIn]); // Added isClockedIn as dependency

  const checkShiftForToday = async () => {
    if (!profile?.id) {
      setLoadingShift(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: shift, error } = await supabase
        .from('upcoming_shifts')
        .select('id')
        .eq('user_id', profile.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      setHasShiftToday(!!shift);
    } catch (e) {
      console.error('Failed to check shift for today:', e);
      setHasShiftToday(false);
    } finally {
      setLoadingShift(false);
    }
  };

  // Create a wrapper function that also refreshes shift status
  const handleStatusChange = async () => {
    await onStatusChange();
    // Refresh shift status after clock operations
    await checkShiftForToday();
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Don't render the card if loading or no shift today (unless already clocked in)
  if (loadingShift) {
    return (
      <View style={styles.clockSection}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.background,
              borderColor: theme.secondary,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <ActivityIndicator size="small" color={theme.foreground} />
        </View>
      </View>
    );
  }

  if (!hasShiftToday && !isClockedIn) {
    return null; // Don't show the card if no shift today and not clocked in
  }

  return (
    <View style={styles.clockSection}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.background,
            borderColor: theme.secondary,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>Time Tracking</Text>
          <View style={styles.statusContainer}>
            <FontAwesome
              name="clock-o"
              size={14}
              color={theme.icon}
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: theme.icon }]}>
              {isClockedIn ? 'Clocked in' : 'Ready to clock in'}
            </Text>
          </View>
        </View>
        {isClockedIn && (
          <Text style={[styles.timerText, { color: theme.foreground }]}>
            {formatDuration(elapsed)}
          </Text>
        )}
        <ClockButton
          isClockedIn={isClockedIn}
          onStatusChange={handleStatusChange}
          elapsedTime={elapsed}
          hasShiftToday={hasShiftToday}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clockSection: {
    marginBottom: 32,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
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
  },
  timerText: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
});
