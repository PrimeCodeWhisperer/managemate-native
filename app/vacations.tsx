import BackHeader from '@/components/BackHeader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useVacations } from '@/hooks/useVacations';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VacationsScreen() {
  const { vacations, loading, error, refresh, addVacation } = useVacations();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(true);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    try {
      setSubmitting(true);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      if (endDate < startDate) {
        Alert.alert('Error', 'End date must be after start date');
        return;
      }
      
      await addVacation(startDateStr, endDateStr);
      setStartDate(new Date());
      setEndDate(new Date());
      setShowDateModal(false);
      setShowStartPicker(true);
      setShowEndPicker(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit vacation');
    } finally {
      setSubmitting(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before the new start date, update end date
      if (endDate < selectedDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const confirmStartDate = () => {
    setShowStartPicker(false);
    setShowEndPicker(true);
  };

  const confirmEndDate = () => {
    setShowEndPicker(false);
  };

  const editStartDate = () => {
    setShowStartPicker(true);
    setShowEndPicker(false);
  };

  const editEndDate = () => {
    setShowStartPicker(false);
    setShowEndPicker(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: theme.successBackground, text: theme.success };
      case 'pending':
        return { bg: theme.warningBackground || '#FEF3C7', text: theme.warning || '#D97706' };
      case 'rejected':
        return { bg: theme.destructiveBackground, text: theme.destructive };
      default:
        return { bg: theme.muted, text: theme.mutedForeground };
    }
  };

  const renderVacation = (v: any) => {
    const range = `${format(parseISO(v.start_date), 'MMM d, yyyy')} - ${format(parseISO(v.end_date), 'MMM d, yyyy')}`;
    const statusColors = getStatusColor(v.status || 'pending');
    
    return (
      <View 
        key={v.id} 
        style={[
          styles.vacationCard, 
          { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow 
          }
        ]}
      > 
        <View style={styles.cardHeader}>
          <View style={styles.vacationInfo}>
            <Text style={[styles.vacationRange, { color: theme.foreground }]}>{range}</Text>
            <Text style={[styles.vacationDates, { color: theme.mutedForeground }]}>
              {format(parseISO(v.start_date), 'EEEE')} - {format(parseISO(v.end_date), 'EEEE')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {v.status || 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <BackHeader title="Vacation Requests" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={styles.loadingText}>Loading vacation requests...</ThemedText>
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
          <BackHeader title="Vacation Requests" />
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={refresh}
            >
              <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>        
        <View style={styles.content}>
          <ScrollView
            style={styles.vacationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.vacationsListContent}
          >
            {vacations.length > 0 ? (
              vacations.map(renderVacation)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-clear-outline" size={48} color={theme.mutedForeground} />
                <ThemedText style={[styles.emptyText, { color: theme.mutedForeground }]}>
                  No vacation requests yet
                </ThemedText>
                <ThemedText style={[styles.emptySubtext, { color: theme.mutedForeground }]}>
                  Tap the button below to request time off
                </ThemedText>
              </View>
            )}
          </ScrollView>

          <View style={[styles.buttonContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowDateModal(true);
                setShowStartPicker(true);
                setShowEndPicker(false);
              }}
            >
              <Ionicons name="add" size={20} color={theme.primaryForeground} />
              <Text style={[styles.addButtonText, { color: theme.primaryForeground }]}>
                Request Vacation
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showDateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Request Vacation</ThemedText>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.secondary }]}
                onPress={() => setShowDateModal(false)}
              >
                <Ionicons name="close" size={16} color={theme.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <ThemedText style={[styles.modalSubtext, { color: theme.mutedForeground }]}>
                Select your vacation dates
              </ThemedText>

              <View style={styles.datePickerContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.dateLabel}>Start Date</ThemedText>
                  {!showStartPicker && (
                    <TouchableOpacity onPress={editStartDate}>
                      <Text style={[styles.editButton, { color: theme.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.datePickerSection}>
                  <Text style={[styles.selectedDateText, { color: theme.foreground }]}>
                    {format(startDate, 'EEEE, MMMM d, yyyy')}
                  </Text>
                  
                  {showStartPicker && (
                    <>
                      <DateTimePicker
                        value={startDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onStartDateChange}
                        minimumDate={new Date()}
                        themeVariant={scheme}
                      />
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                        onPress={confirmStartDate}
                      >
                        <Text style={[styles.confirmButtonText, { color: theme.primaryForeground }]}>
                          Confirm Start Date
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.datePickerContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.dateLabel}>End Date</ThemedText>
                  {!showEndPicker && (
                    <TouchableOpacity onPress={editEndDate}>
                      <Text style={[styles.editButton, { color: theme.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.datePickerSection}>
                  <Text style={[styles.selectedDateText, { color: theme.foreground }]}>
                    {format(endDate, 'EEEE, MMMM d, yyyy')}
                  </Text>
                  
                  {showEndPicker && (
                    <>
                      <DateTimePicker
                        value={endDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onEndDateChange}
                        minimumDate={startDate}
                        themeVariant={scheme}
                      />
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                        onPress={confirmEndDate}
                      >
                        <Text style={[styles.confirmButtonText, { color: theme.primaryForeground }]}>
                          Confirm End Date
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setShowDateModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveModalButton, 
                  { backgroundColor: theme.primary },
                  (submitting || showStartPicker || showEndPicker) && styles.disabledButton
                ]}
                onPress={submit}
                disabled={submitting || showStartPicker || showEndPicker}
              >
                <Text style={[styles.saveModalButtonText, { color: theme.primaryForeground }]}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  vacationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  vacationsListContent: {
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  vacationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vacationInfo: {
    flex: 1,
  },
  vacationRange: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vacationDates: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom:26,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalSubtext: {
    fontSize: 14,
    marginBottom: 24,
  },
  datePickerContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  datePickerSection: {
    gap: 12,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
