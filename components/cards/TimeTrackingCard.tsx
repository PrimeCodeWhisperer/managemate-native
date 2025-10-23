import ClockButton from '@/components/cards/ClockButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Shift } from '@/hooks/useShifts';
import { FontAwesome } from '@expo/vector-icons';
import { isSameDay, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  isClockedIn: boolean;
  onStatusChange: (immediateClockInTime?: number) => Promise<void> | void;
  startTime: number | null;
  shifts: Shift[]; // Add this prop
  loading?: boolean; // Add this prop
}

export default function TimeTrackingCard({ isClockedIn, onStatusChange, startTime, shifts, loading = false }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [elapsed, setElapsed] = useState(0);

  // Use useMemo to check if there's a shift today, similar to schedule component
  const todayShift = useMemo(() => {
    if (!shifts.length) return null;
    
    const today = new Date();
    return shifts.find((shift) => {
      const shiftDate = parseISO(String(shift.date));
      return isSameDay(shiftDate, today);
    });
  }, [shifts]);

  const hasShiftToday = useMemo(() => {
    return !!todayShift;
  }, [todayShift]);

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

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Don't render the card if loading or no shift today (unless already clocked in)
  if (loading) {
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
          <Text style={[styles.cardTitle, { color: theme.foreground }]}>{'Upcoming Shift'}</Text>
          <View style={styles.statusContainer}>
            <FontAwesome
              name="clock-o"
              size={14}
              color={theme.icon}
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: theme.icon }]}>
              {isClockedIn ? 'Clocked in' : todayShift?.start_time}
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
          onStatusChange={onStatusChange}
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
