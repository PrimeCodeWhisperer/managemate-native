import ErrorBoundary from '@/components/ErrorBoundary';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useVacations } from '@/hooks/useVacations';
import { format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VacationsScreen() {
  const { vacations, loading, error, refresh, addVacation } = useVacations();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    try {
      setSubmitting(true);
      await addVacation(startDate, endDate);
      setStartDate('');
      setEndDate('');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit vacation');
    } finally {
      setSubmitting(false);
    }
  };

  const renderVacation = (v: any) => {
    const range = `${format(parseISO(v.start_date), 'MMM d, yyyy')} - ${format(parseISO(v.end_date), 'MMM d, yyyy')}`;
    return (
      <View key={v.id} style={[styles.vacationItem, { borderColor: theme.secondary, backgroundColor: theme.background, shadowColor: theme.shadow }]}> 
        <Text style={[styles.vacationRange, { color: theme.foreground }]}>{range}</Text>
        {v.status && <Text style={[styles.vacationStatus, { color: theme.icon }]}>{v.status}</Text>}
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.foreground }]}>{error}</Text>
            <Button title="Retry" onPress={refresh} />
          </View>
        ) : vacations.length > 0 ? (
          vacations.map(renderVacation)
        ) : (
          <Text style={[styles.emptyText, { color: theme.icon }]}>No vacations requested</Text>
        )}

        <View style={styles.form}>
          <Text style={[styles.formTitle, { color: theme.foreground }]}>Request Vacation</Text>
          <TextInput
            placeholder="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            style={[styles.input, { borderColor: theme.secondary, color: theme.foreground }]}
            placeholderTextColor={theme.icon}
          />
          <TextInput
            placeholder="End Date (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            style={[styles.input, { borderColor: theme.secondary, color: theme.foreground }]}
            placeholderTextColor={theme.icon}
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={submit}
            disabled={submitting}
          >
            <Text style={[styles.submitButtonText, { color: theme.primaryForeground }]}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  vacationItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vacationRange: {
    fontSize: 16,
    fontWeight: '500',
  },
  vacationStatus: {
    marginTop: 4,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  errorText: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  form: {
    gap: 12,
    marginTop: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
