import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { Ionicons } from '@expo/vector-icons';
import { addMonths, format, isSameMonth, parseISO, subMonths } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Shift { 
  id: string; 
  date: string; 
  start_time: string; 
  end_time: string;
  location?: string;
  role?: string;
  status?: string;
}

export default function TimesheetScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;

      const base = supabase
        .from('past_shifts')
        .select('*')
        .order('date', { ascending: false })
        .order('end_time', { ascending: false });
      const { data, error } = user?.id ? await base.eq('user_id', user.id) : await base;
      if (error) throw error;
      setShifts((data ?? []) as Shift[]);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load timesheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadShifts(); }, []);

  const monthShifts = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = parseISO(shift.date);
      return isSameMonth(shiftDate, currentDate);
    });
  }, [shifts, currentDate]);

  const groupedShifts = useMemo(() => {
    const grouped = monthShifts.reduce((acc, shift) => {
      const date = shift.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {} as Record<string, Shift[]>);

    // Sort dates in descending order
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

  const formatShiftTime = (startTime: string, endTime: string) => {
    const start = format(parseISO(`2000-01-01T${startTime}`), 'h:mm a');
    const end = format(parseISO(`2000-01-01T${endTime}`), 'h:mm a');
    return `${start} - ${end}`;
  };

  const calculateShiftDuration = (startTime: string, endTime: string) => {
    const start = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const getShiftStatus = (startTime: string, endTime: string) => {
    const start = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (hours > 8) {
    return { status: 'Overtime', color: '#fbbf24', backgroundColor: '#fbbf2420' };
    }
    return { status: 'Completed', color: '#22c55e', backgroundColor: '#22c55e20' };
  };
  if (loading) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <ThemedText>{error}</ThemedText>
            <Button title="Retry" onPress={loadShifts} />
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
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
          <ThemedText style={styles.totalHours}>
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
        contentContainerStyle={styles.shiftsListContent}
      >
        {groupedShifts.length > 0 ? (
          groupedShifts.map(([date, dayShifts]) => (
            <View key={date} style={styles.dateGroup}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <ThemedText style={styles.dateHeaderText}>
                  {format(parseISO(date), 'EEEE, MMMM do')}
                </ThemedText>
              </View>

              {/* Shifts for this date */}
              {dayShifts.map((shift) => {
                const shiftStatus = getShiftStatus(shift.start_time, shift.end_time);
                return (
                  <View key={shift.id} style={[styles.shiftCard, { backgroundColor: theme.background, borderColor: theme.secondary }]}>
                    <View style={styles.shiftCardHeader}>
                      <View style={styles.shiftInfo}>
                        <ThemedText style={styles.shiftTitle}>
                          {shift.role || 'Shift'}
                        </ThemedText>
                        <ThemedText style={[styles.shiftLocation, { color: theme.icon }]}>
                          {shift.location || 'Store Location'}
                        </ThemedText>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: shiftStatus.backgroundColor }]}>
                        <Text style={[styles.statusText, { color: shiftStatus.color }]}>
                          {shiftStatus.status}
                        </Text>
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

      {/* Monthly Hours Summary */}
      <View style={[styles.monthlySummary, { backgroundColor: theme.background, borderColor: theme.secondary }]}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryInfo}>
            <ThemedText style={[styles.summaryLabel, { color: theme.icon }]}>
              Total Hours in {format(currentDate, 'MMMM')}
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              {Math.round(totalHours)} hours
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.exportButtonText, { color: theme.primaryForeground }]}> 
              Export PDF
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalHours: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  shiftsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  shiftsListContent: {
    paddingBottom: 100, // Account for summary section
  },
  dateGroup: {
    marginBottom: 8,
  },
  dateHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  shiftCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shiftLocation: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shiftTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftTime: {
    fontSize: 14,
  },
  shiftDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  monthlySummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 2,
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
