import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Shift, useShifts } from '@/hooks/useShifts';
import { Ionicons } from '@expo/vector-icons';
import { addMonths, format, isSameMonth, parseISO, subMonths } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Alert, Button, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // NEW

export default function TimesheetScreen() {
  const insets = useSafeAreaInsets(); // NEW
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  
  const { shifts, error, refresh } = useShifts('past');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const monthShifts = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = parseISO(shift.date);
      return isSameMonth(shiftDate, currentDate);
    });
  }, [shifts, currentDate]);

  const groupedShifts = useMemo(() => {
    const grouped = monthShifts.reduce((acc, shift) => {
      const date = shift.date;
      (acc[date] ||= []).push(shift);
      return acc;
    }, {} as Record<string, Shift[]>);
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [monthShifts]);

  const totalHours = useMemo(() => {
    return monthShifts.reduce((total, shift) => {
      const start = parseISO(`2000-01-01T${shift.start_time}`);
      const end = parseISO(`2000-01-01T${shift.end_time}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  }, [monthShifts]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const formatShiftTime = (startTime: string, endTime?: string) => {
    const start = format(parseISO(`2000-01-01T${startTime}`), 'h:mm a');
    const end = endTime ? format(parseISO(`2000-01-01T${endTime}`), 'h:mm a') : '';
    return end ? `${start} - ${end}` : start;
  };

  const calculateShiftDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return '';
    const start = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const getShiftStatus = (startTime: string, endTime?: string) => {
    if (!endTime) {
      return { status: 'In Progress', color: theme.info, backgroundColor: theme.infoBackground };
    }
    const start = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours > 8) return { status: 'Overtime', color: theme.warning, backgroundColor: theme.warningBackground };
    return { status: 'Completed', color: theme.success, backgroundColor: theme.successBackground };
  };

  if (error) {
    return (
      <ErrorBoundary>
        <ThemedView style={[styles.container]}> 
          <View style={styles.errorContainer}>
            <ThemedText>{error}</ThemedText>
            <Button title="Retry" onPress={refresh} />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1 }} edges={['top','left','right']}>{/* NEW */}
        <ThemedView> 
          {/* Month Navigator */}
          <View style={styles.monthNavigator}>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: theme.secondary }]}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={16} color={theme.foreground} />
            </TouchableOpacity>
            
            <View style={styles.monthInfo}>
              <ThemedText style={styles.monthText}>
                {format(currentDate, 'MMMM yyyy')}
              </ThemedText>
              <ThemedText style={[styles.totalHours, { color: theme.icon }]}>
                Total: {Math.round(totalHours)} hours
              </ThemedText>
            </View>
            
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: theme.secondary }]}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={16} color={theme.foreground} />
            </TouchableOpacity>
          </View>

          {/* Shifts List */}
          <ScrollView
            style={styles.shiftsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom*1.7,   // NEW space for floating summary + FAB
            }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {groupedShifts.length > 0 ? (
              groupedShifts.map(([date, dayShifts]) => (
                <View key={date} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <ThemedText style={[styles.dateHeaderText, { color: theme.icon }]}>
                      {format(parseISO(date), 'EEEE, MMMM do')}
                    </ThemedText>
                  </View>
                  {dayShifts.map((shift) => {
                    const shiftStatus = getShiftStatus(shift.start_time, shift.end_time);
                    return (
                      <View key={shift.id} style={[styles.shiftCard, { backgroundColor: theme.background, borderColor: theme.secondary, shadowColor: theme.shadow }]}> 
                        <View style={styles.shiftCardHeader}>
                          <View style={styles.shiftInfo}>
                            <ThemedText style={styles.shiftTitle}>Shift</ThemedText>
                            {shift.role ?? (
                              <ThemedText style={[styles.shiftLocation, { color: theme.icon }]}>
                                {shift.location || 'Employee'}
                              </ThemedText>
                            )}
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: shiftStatus.backgroundColor }]}>
                            <Text style={[styles.statusText, { color: shiftStatus.color }]}>{shiftStatus.status}</Text>
                          </View>
                        </View>
                        <View style={styles.shiftTimeContainer}>
                          <View style={styles.shiftTimeLeft}>
                            <Ionicons name="time-outline" size={16} color={theme.icon} />
                            <ThemedText style={styles.shiftTime}>
                              {formatShiftTime(shift.start_time, shift.end_time)}
                            </ThemedText>
                          </View>
                          <ThemedText style={styles.shiftDuration}>
                            {calculateShiftDuration(shift.start_time, shift.end_time)}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={[styles.emptyStateText, { color: theme.icon }]}>
                  No shifts recorded for {format(currentDate, 'MMMM yyyy')}
                </ThemedText>
              </View>
            )}
          </ScrollView>

          {/* Modern floating summary pill + Export FAB */}
          <View
            pointerEvents="box-none"
            style={[
              styles.floatingContainer,
              { bottom: insets.bottom *3} // sit above native tab bar
            ]}
          >
            <View
              style={[
                styles.summaryPill,
                { backgroundColor: theme.background, borderColor: theme.secondary, shadowColor: theme.shadow }
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time" size={18} color={theme.icon} />
                <ThemedText style={[styles.summaryLabel, { color: theme.icon }]}>
                  Total in {format(currentDate, 'MMMM')}
                </ThemedText>
              </View>
              <ThemedText style={styles.summaryValue}>
                {Math.round(totalHours)}h
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.shadow }]}
              onPress={() => {Alert.alert('Coming Soon',"Export As PDS not available yet.")}}
              accessibilityLabel="Export timesheet as PDF"
              activeOpacity={0.85}
            >
              <Ionicons name="document-text-outline" size={22} color={theme.primaryForeground} />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0 }, // top handled by insets
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16 },

  monthNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  navButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  monthInfo: { alignItems: 'center' },
  monthText: { fontSize: 18, fontWeight: '600' },
  totalHours: { fontSize: 12, marginTop: 2 },

  shiftsList: { flex: 1, paddingHorizontal: 16 },
  dateGroup: { marginBottom: 8 },
  dateHeader: { marginTop: 16, marginBottom: 8 },
  dateHeaderText: { fontSize: 14, fontWeight: '500' },
  shiftCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  shiftCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  shiftInfo: { flex: 1 },
  shiftTitle: { fontSize: 16, fontWeight: '600' },
  shiftLocation: { fontSize: 14, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  shiftTimeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftTimeLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shiftTime: { fontSize: 14 },
  shiftDuration: { fontSize: 14, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64 },
  emptyStateText: { fontSize: 16, textAlign: 'center' },

  // Modern floating summary + FAB
  floatingContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryPill: {
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
