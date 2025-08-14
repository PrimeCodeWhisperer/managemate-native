import ClockButton from '@/components/cards/ClockButton';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Props {
  isClockedIn: boolean;
  onStatusChange: () => Promise<void> | void;
  startTime: number | null;
}

export default function TimeTrackingCard({ isClockedIn, onStatusChange, startTime }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isClockedIn && startTime) {
      const update = () => setElapsed(Date.now() - startTime);
      update();
      interval = setInterval(update, 1000);
    } else {
      setElapsed(0);
    }
    return () => interval && clearInterval(interval);
  }, [isClockedIn, startTime]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
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
              {isClockedIn ? 'Clocked in' : 'Not clocked in'}
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
