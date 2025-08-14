import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Login error', e.message ?? 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
        <ThemedText type="title" style={{ marginBottom: 16 }}>ManageMate</ThemedText>

        <View style={styles.field}>
          <ThemedText>Email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={scheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            style={[styles.input, { borderColor: theme.secondary, color: theme.foreground }]}
          />
        </View>

        <View style={styles.field}>
          <ThemedText>Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={scheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            style={[styles.input, { borderColor: theme.secondary, color: theme.foreground }]}
          />
        </View>

        <Pressable disabled={loading} onPress={signIn} style={[styles.button, { backgroundColor: theme.primary }]}>
          <ThemedText style={{ color: theme.primaryForeground, textAlign: 'center', fontWeight: '600' }}>{loading ? 'Signing in…' : 'Sign In'}</ThemedText>
        </Pressable>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  field: { marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 6 },
  button: { marginTop: 8, padding: 14, borderRadius: 12 },
});
