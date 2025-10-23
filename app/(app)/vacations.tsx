import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useVacations } from '@/hooks/useVacations';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { add, format, parseISO } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function VacationsScreen() {
  const insets = useSafeAreaInsets();
  const { vacations, loading, error, refresh, addVacation } = useVacations();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  // Dates start undefined on both platforms; user explicitly picks them
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [candidateStartDate, setCandidateStartDate] = useState<Date | null>(null);
  const [candidateEndDate, setCandidateEndDate] = useState<Date | null>(null);

  const [showDateModal, setShowDateModal] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canSubmit = useMemo(() => !!startDate && !!endDate && !showStartPicker && !showEndPicker, [startDate, endDate, showStartPicker, showEndPicker]);


  //Assume employees can only plan vacations up to three weeks before
  const defaultStartDate=add(new Date(),{weeks:3})
  const submit = async () => {
    try {
      if (!startDate || !endDate) return;
      setSubmitting(true);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      if (endDate < startDate) {
        Alert.alert('Error', 'End date must be after start date');
        return;
      }else if(!startDate){
        Alert.alert('Error', 'Start date not inserted');
        return;

      }else if(!endDate){
        Alert.alert('Error', 'End date not inserted');
        return
      }
      await addVacation(startDateStr, endDateStr);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit vacation');
    } finally {
      setSubmitting(false);
    }
  };

  const openStartPicker = () => { 
    setShowStartPicker(true); 
    setShowEndPicker(false);
    if(Platform.OS==='ios' && !candidateStartDate) setCandidateStartDate(defaultStartDate)
  };
  const openEndPicker = () => { 
    setShowEndPicker(true); 
    setShowStartPicker(false); 
    if(Platform.OS==='ios' && !candidateEndDate){
      if (startDate){setCandidateEndDate(startDate)} 
      else {setCandidateEndDate(defaultStartDate)};
    }

  };

  // Only commit on explicit confirm (iOS) or selection (Android)
  const onStartDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'set' && selected) {
        setStartDate(selected);
        if (endDate && endDate<selected) setEndDate(null)
      }
      setShowStartPicker(false);
      return;
    }
    if (selected) setCandidateStartDate(selected);
  };

  const onEndDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'set' && selected) setEndDate(selected);
      setShowEndPicker(false);
      return;
    }
    if (selected) setCandidateEndDate(selected);
  };

  const onConfirmStartIOS = () => {
    setShowStartPicker(false);
    setStartDate(candidateStartDate);
    if (startDate && endDate && endDate<startDate) setEndDate(null)
    setCandidateStartDate(null);
  };
  const onConfirmEndIOS = () => {
    setShowEndPicker(false);
    setEndDate(candidateEndDate);
    setCandidateEndDate(null);
  };
  const onClose=()=>{
      setCandidateStartDate(null);
      setCandidateEndDate(null);
      setStartDate(null);
      setEndDate(null);
      setShowDateModal(false);
      setShowStartPicker(false);
      setShowEndPicker(false);
  }
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return { bg: theme.successBackground, text: theme.success };
      case 'pending': return { bg: theme.warningBackground || '#FEF3C7', text: theme.warning || '#D97706' };
      case 'rejected': return { bg: theme.destructiveBackground, text: theme.destructive };
      default: return { bg: theme.muted, text: theme.mutedForeground };
    }
  };

  const renderVacation = (v: any) => {
    const range = `${format(parseISO(v.start_date), 'MMM d, yyyy')} - ${format(parseISO(v.end_date), 'MMM d, yyyy')}`;
    const statusColors = getStatusColor(v.status || 'pending');
    return (
      <View key={v.id} style={[styles.vacationCard, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <View style={styles.cardHeader}>
          <View style={styles.vacationInfo}>
            <Text style={[styles.vacationRange, { color: theme.foreground }]}>{range}</Text>
            <Text style={[styles.vacationDates, { color: theme.mutedForeground }]}>
              {format(parseISO(v.start_date), 'EEEE')} - {format(parseISO(v.end_date), 'EEEE')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{v.status || 'Pending'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
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
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={refresh}>
              <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ErrorBoundary>
    );
  }

  const onRefresh = async () => { setRefreshing(true); try { await refresh(); } finally { setRefreshing(false); } };

  const renderDateText = (d: Date | null, placeholder: string) => (
    <Text style={[styles.selectedDateText, { color: d ? theme.foreground : theme.mutedForeground }]}>
      {d ? format(d, 'EEEE, MMMM d, yyyy') : placeholder}
    </Text>
  );

  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ScrollView
            style={styles.vacationsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.vacationsListContent]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {vacations.length > 0 ? vacations.map(renderVacation) : (
              <View className="empty" style={styles.emptyContainer}>
                <Ionicons name="calendar-clear-outline" size={48} color={theme.mutedForeground} />
                <ThemedText style={[styles.emptyText, { color: theme.mutedForeground }]}>No vacation requests yet</ThemedText>
                <ThemedText style={[styles.emptySubtext, { color: theme.mutedForeground }]}>Tap the button to request time off</ThemedText>
              </View>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary, bottom: insets.bottom, shadowColor: theme.shadow }]}
          onPress={() => { setShowDateModal(true); setShowStartPicker(false); setShowEndPicker(false); }}
          activeOpacity={0.8}
          accessibilityLabel="Request vacation"
        >
          <Ionicons name="add" size={24} color={theme.primaryForeground} />
        </TouchableOpacity>

        <Modal
          visible={showDateModal}
          animationType="slide"
          presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
          onRequestClose={onClose}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Request Vacation</ThemedText>
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.secondary }]} onPress={onClose}>
                <Ionicons name="close" size={16} color={theme.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <ThemedText style={[styles.modalSubtext, { color: theme.mutedForeground }]}>Select your vacation dates</ThemedText>

              <View style={styles.datePickerContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.dateLabel}>Start Date</ThemedText>
                  {Platform.OS === 'ios' && !showStartPicker && (
                    <TouchableOpacity onPress={openStartPicker}>
                      <Text style={[styles.editButton, { color: theme.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.datePickerSection}>
                  {Platform.OS === 'android' ? (
                    <TouchableOpacity style={styles.dateRowInteractive} onPress={openStartPicker}>
                      {renderDateText(startDate, 'Tap to choose start date')}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={openStartPicker}>
                      {renderDateText(startDate, 'Select a start date')}
                    </TouchableOpacity>
                  )}

                  {showStartPicker && (
                    <DateTimePicker
                      value={candidateStartDate ?? defaultStartDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onStartDateChange}
                      minimumDate={defaultStartDate}
                      themeVariant={scheme}
                    />
                  )}

                  {Platform.OS === 'ios' && showStartPicker && (
                    <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={onConfirmStartIOS}>
                      <Text style={[styles.confirmButtonText, { color: theme.primaryForeground }]}>Confirm Start Date</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.datePickerContainer}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.dateLabel}>End Date</ThemedText>
                  {Platform.OS === 'ios' && !showEndPicker && (
                    <TouchableOpacity onPress={openEndPicker}>
                      <Text style={[styles.editButton, { color: theme.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.datePickerSection}>
                  {Platform.OS === 'android' ? (
                    <TouchableOpacity style={styles.dateRowInteractive} onPress={openEndPicker}>
                      {renderDateText(endDate, 'Tap to choose end date')}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={openEndPicker}>
                      {renderDateText(endDate, 'Select an end date')}
                    </TouchableOpacity>
                  )}

                  {showEndPicker && (
                    <DateTimePicker
                      value={candidateEndDate ?? (startDate ?? defaultStartDate)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onEndDateChange}
                      minimumDate={startDate ?? defaultStartDate}
                      themeVariant={scheme}
                    />
                  )}

                  {Platform.OS === 'ios' && showEndPicker && (
                    <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={onConfirmEndIOS}>
                      <Text style={[styles.confirmButtonText, { color: theme.primaryForeground }]}>Confirm End Date</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border }]} onPress={onClose}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveModalButton, { backgroundColor: canSubmit ? theme.primary : theme.secondary }, !canSubmit && styles.disabledButton]}
                onPress={submit}
                disabled={!canSubmit || submitting}
              >
                <Text style={[styles.saveModalButtonText, { color: canSubmit ? theme.primaryForeground : theme.foreground }]}>
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
  container: { flex: 1 },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 16 },
  errorText: { fontSize: 16, textAlign: 'center' },
  retryButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  vacationsList: { flex: 1, paddingHorizontal: 16 },
  vacationsListContent: { paddingTop: 16, gap: 12 },
  vacationCard: { borderWidth: 1, borderRadius: 12, padding: 16, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vacationInfo: { flex: 1 },
  vacationRange: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  vacationDates: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, zIndex: 1000 },
  modalContainer: { flex: 1, paddingTop: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  closeButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modalContent: { flex: 1, paddingHorizontal: 24 },
  modalSubtext: { fontSize: 14, marginBottom: 24 },
  datePickerContainer: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateLabel: { fontSize: 16, fontWeight: '500' },
  editButton: { fontSize: 14, fontWeight: '500' },
  datePickerSection: { gap: 12 },
  selectedDateText: { fontSize: 16, fontWeight:  '500' },
  confirmButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center' },
  confirmButtonText: { fontSize: 14, fontWeight: '500' },
  dateRowInteractive: { paddingVertical: 12, paddingRight: 8, minHeight: 44 },
  modalActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 34 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  cancelButtonText: { fontSize: 16, fontWeight: '500' },
  saveModalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveModalButtonText: { fontSize: 16, fontWeight: '500' },
});