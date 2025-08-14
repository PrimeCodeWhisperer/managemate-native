import { supabase } from '@/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [username, setUsername] = useState<string | null>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);

  const load = async () => {
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      const { data: profileRes, error: profileErr } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileErr) throw profileErr;
      const profile = profileRes;
      setUsername(profile.username)
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClockIn = () => {
    if (!isClockedIn) {
      setIsClockedIn(true);
    }
  };

  const handleClockOut = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {username || 'Sarah'}!</Text>
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
            
            <View style={styles.clockButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.clockButton,
                  isClockedIn ? styles.clockButtonDisabled : styles.clockInButton
                ]}
                onPress={handleClockIn}
                disabled={isClockedIn}
              >
                <FontAwesome 
                  name="play" 
                  size={18} 
                  color={isClockedIn ? "#9CA3AF" : "white"} 
                  style={styles.clockButtonIcon}
                />
                <Text style={[
                  styles.clockButtonText,
                  isClockedIn ? styles.clockButtonTextDisabled : styles.clockButtonTextActive
                ]}>
                  Clock In
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.clockButton,
                  isClockedIn ? styles.clockOutButton : styles.clockButtonDisabled
                ]}
                onPress={handleClockOut}
                disabled={!isClockedIn}
              >
                <FontAwesome 
                  name="stop" 
                  size={18} 
                  color={isClockedIn ? "white" : "#9CA3AF"} 
                  style={styles.clockButtonIcon}
                />
                <Text style={[
                  styles.clockButtonText,
                  isClockedIn ? styles.clockButtonTextActive : styles.clockButtonTextDisabled
                ]}>
                  Clock Out
                </Text>
              </TouchableOpacity>
            </View>
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
            {/* Shift Card 1 */}
            <View style={styles.shiftCard}>
              <View style={styles.shiftCardContent}>
                <View style={styles.shiftInfo}>
                  <View style={styles.shiftHeader}>
                    <Text style={styles.shiftDate}>Today</Text>
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                  </View>
                  <Text style={styles.shiftTitle}>Morning Shift</Text>
                  <Text style={styles.shiftTime}>8:00 AM - 4:00 PM</Text>
                </View>
                <TouchableOpacity style={styles.pickUpButton}>
                  <Text style={styles.pickUpButtonText}>Pick Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shift Card 2 */}
            <View style={styles.shiftCard}>
              <View style={styles.shiftCardContent}>
                <View style={styles.shiftInfo}>
                  <View style={styles.shiftHeader}>
                    <Text style={styles.shiftDate}>Tomorrow</Text>
                  </View>
                  <Text style={styles.shiftTitle}>Evening Shift</Text>
                  <Text style={styles.shiftTime}>4:00 PM - 12:00 AM</Text>
                </View>
                <TouchableOpacity style={styles.pickUpButton}>
                  <Text style={styles.pickUpButtonText}>Pick Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shift Card 3 */}
            <View style={styles.shiftCard}>
              <View style={styles.shiftCardContent}>
                <View style={styles.shiftInfo}>
                  <View style={styles.shiftHeader}>
                    <Text style={styles.shiftDate}>May 18</Text>
                  </View>
                  <Text style={styles.shiftTitle}>Weekend Shift</Text>
                  <Text style={styles.shiftTime}>10:00 AM - 6:00 PM</Text>
                </View>
                <TouchableOpacity style={styles.pickUpButton}>
                  <Text style={styles.pickUpButtonText}>Pick Up</Text>
                </TouchableOpacity>
              </View>
            </View>
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
