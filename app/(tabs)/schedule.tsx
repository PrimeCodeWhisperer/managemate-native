import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { Ionicons } from '@expo/vector-icons';
import { addMonths, format, formatISO, getDay, getDaysInMonth, isSameDay, parseISO, startOfMonth, subMonths } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Shift { 
  id: string; 
  date: string; 
  start_time: string; 
  end_time?: string;
  location?: string;
  role?: string;
  status?: string;
}

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatISO(new Date(), { representation: 'date' }));

  useEffect(() => {
    (async () => {
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = userRes.user;

        const base = supabase
          .from('upcoming_shifts')
          .select('*')
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });
        const { data, error } = user?.id ? await base.eq('user_id', user.id) : await base;
        if (error) throw error;
        setShifts((data ?? []) as Shift[]);
      } catch (e: any) {
        Alert.alert('Error', e.message ?? 'Failed to load shifts');
      }
    })();
  }, []);

  const monthShifts = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = parseISO(String(shift.date));
      return shiftDate.getMonth() === currentDate.getMonth() && 
             shiftDate.getFullYear() === currentDate.getFullYear();
    });
  }, [shifts, currentDate]);

  const selectedDayShifts = useMemo(() => {
    const day = parseISO(selectedDate);
    return shifts.filter((s) => isSameDay(parseISO(String(s.date)), day));
  }, [selectedDate, shifts]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);
    const startingDayOfWeek = getDay(firstDayOfMonth);
    
    const days = [];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), -i);
      days.push({
        day: prevDate.getDate(),
        date: formatISO(prevDate, { representation: 'date' }),
        isCurrentMonth: false,
        hasShift: false
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = formatISO(date, { representation: 'date' });
      const hasShift = monthShifts.some(shift => shift.date === dateString);
      
      days.push({
        day,
        date: dateString,
        isCurrentMonth: true,
        hasShift
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        day,
        date: formatISO(nextDate, { representation: 'date' }),
        isCurrentMonth: false,
        hasShift: false
      });
    }
    
    return days;
  }, [currentDate, monthShifts]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const formatShiftTime = (startTime: string, endTime?: string) => {
    const start = format(parseISO(`2000-01-01T${startTime}`), 'h:mm a');
    if (endTime) {
      const end = format(parseISO(`2000-01-01T${endTime}`), 'h:mm a');
      return `${start} - ${end}`;
    }
    return start;
  };

  const calculateShiftDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return '';
    const start = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <ThemedText style={styles.shiftsCount}>
              {monthShifts.length} shifts scheduled
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={[styles.navButton, { backgroundColor: theme.secondary }]}
            onPress={() => navigateMonth('next')}
          >
            <Ionicons name="chevron-forward" size={16} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <ThemedText key={index} style={styles.dayHeader}>{day}</ThemedText>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((calendarDay, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  calendarDay.hasShift && styles.dayWithShift,
                  selectedDate === calendarDay.date && styles.selectedDay,
                  !calendarDay.isCurrentMonth && styles.otherMonthDay
                ]}
                onPress={() => calendarDay.isCurrentMonth && setSelectedDate(calendarDay.date)}
              >
                <Text style={[
                  styles.calendarDayText,
                  { color: theme.foreground },
                  calendarDay.hasShift && styles.dayWithShiftText,
                  selectedDate === calendarDay.date && styles.selectedDayText,
                  !calendarDay.isCurrentMonth && styles.otherMonthText
                ]}>
                  {calendarDay.day}
                </Text>
                {calendarDay.hasShift && (
                  <View style={[
                    styles.shiftDot,
                    selectedDate === calendarDay.date && { backgroundColor: theme.foreground }
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Day Shift Info */}
        {selectedDayShifts.length > 0 && (
          <View style={styles.shiftInfoContainer}>
            {selectedDayShifts.map((shift) => (
              <View key={shift.id} style={[styles.shiftCard, { backgroundColor: theme.background, borderColor: theme.secondary }]}>
                <View style={styles.shiftCardHeader}>
                  <ThemedText style={styles.shiftDate}>
                    {format(parseISO(selectedDate), 'EEEE, MMMM do')}
                  </ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: '#22c55e20' }]}>
                    <Text style={[styles.statusText, { color: '#22c55e' }]}>
                      {shift.status || 'Scheduled'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.shiftDetails}>
                  <View style={styles.shiftDetailRow}>
                    <View style={styles.shiftDetailLeft}>
                      <Ionicons name="time-outline" size={16} color={theme.icon} />
                      <View style={styles.shiftDetailText}>
                        <ThemedText style={styles.shiftDetailTitle}>
                          {shift.role || 'Shift'}
                        </ThemedText>
                        <ThemedText style={[styles.shiftDetailSubtitle, { color: theme.icon }]}>
                          {formatShiftTime(shift.start_time, shift.end_time)}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.shiftDuration}>
                      {calculateShiftDuration(shift.start_time, shift.end_time)}
                    </ThemedText>
                  </View>
                  
                  {shift.location && (
                    <View style={styles.shiftDetailRow}>
                      <Ionicons name="location-outline" size={16} color={theme.icon} />
                      <View style={styles.shiftDetailText}>
                        <ThemedText style={styles.shiftDetailTitle}>
                          {shift.location}
                        </ThemedText>
                        <ThemedText style={[styles.shiftDetailSubtitle, { color: theme.icon }]}>
                          Location
                        </ThemedText>
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.shiftDetailRow}>
                    <Ionicons name="person-outline" size={16} color={theme.icon} />
                    <View style={styles.shiftDetailText}>
                      <ThemedText style={styles.shiftDetailTitle}>
                        {shift.role || 'Sales Associate'}
                      </ThemedText>
                      <ThemedText style={[styles.shiftDetailSubtitle, { color: theme.icon }]}>
                        Floor duty
                      </ThemedText>
                    </View>
                  </View>
                </View>
                
                <View style={styles.shiftActions}>
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.primaryButtonText, { color: theme.primaryForeground }]}>
                      Clock In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.secondary }]}>
                    <ThemedText style={styles.secondaryButtonText}>
                      View Details
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedDayShifts.length === 0 && (
          <View style={styles.noShiftsContainer}>
            <ThemedText style={[styles.noShiftsText, { color: theme.icon }]}>
              No shifts scheduled for {format(parseISO(selectedDate), 'MMMM do')}
            </ThemedText>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ThemedText style={[styles.quickActionsTitle, { color: theme.icon }]}>Quick Actions</ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.secondary }]}>
              <Ionicons name="calendar-outline" size={24} color={theme.foreground} />
              <ThemedText style={styles.quickActionText}>Request Shift</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.secondary }]}>
              <Ionicons name="calendar-clear-outline" size={24} color={theme.foreground} />
              <ThemedText style={styles.quickActionText}>Drop Shift</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingBottom:84
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
  shiftsCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  calendarContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDay: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  dayWithShift: {
    backgroundColor: '#000000',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
  },
  selectedDayText: {
    fontWeight: '600',
  },
  dayWithShiftText: {
    color: '#ffffff',
  },
  otherMonthText: {
    color: '#d1d5db',
  },
  shiftDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  shiftInfoContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  shiftCard: {
    borderRadius: 12,
    padding: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
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
  shiftDetails: {
    gap: 12,
    marginBottom: 16,
  },
  shiftDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shiftDetailText: {
    flex: 1,
  },
  shiftDetailTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  shiftDetailSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  shiftDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  shiftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noShiftsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  noShiftsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
