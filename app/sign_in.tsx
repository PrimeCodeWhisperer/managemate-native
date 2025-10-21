import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets=useSafeAreaInsets()

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

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'your-app-scheme://auth/callback', // Replace with your app's URL scheme
        },
      });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Google Sign In', e.message ?? 'Google sign in is not configured yet');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality will be available soon');
  };

  const handleSignUp = () => {
    Alert.alert('Sign Up', 'Registration functionality will be available soon');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset form state on refresh
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setLoading(false);
    } catch (error) {
      console.error('Failed to refresh login:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
      keyboardVerticalOffset={Platform.OS === 'android' ? 64 : 0}
      style={styles.keyboardView}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
          
          {/* Login Form */}
          <View style={[styles.loginForm,{paddingTop:insets.top}]}>
            
            {/* Welcome Header */}
            <View style={styles.welcomeHeader}>
              <ThemedText style={styles.welcomeTitle}>Welcome Back</ThemedText>
              <Text style={[styles.welcomeSubtitle, { color: theme.icon }]}>
                Sign in to your account
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputFields}>
              
              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.icon }]}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor={theme.mutedForeground}
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.secondary, color: theme.foreground }]}
                  />
                  <Ionicons name="person-outline" size={20} color={theme.mutedForeground} style={styles.inputIcon} />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.icon }]}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.mutedForeground}
                    style={[styles.input, { backgroundColor: theme.background, borderColor: theme.secondary, color: theme.foreground }]}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.inputIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.foreground }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <Pressable
              disabled={loading}
              onPress={signIn}
              style={[
                styles.signInButton,
                { backgroundColor: theme.primary, shadowColor: theme.shadow },
                loading && styles.disabledButton,
              ]}
            >
              <Text style={[styles.signInButtonText, { color: theme.primaryForeground }]}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Text>
            </Pressable>

            {/* Divider */}
            {/* <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.secondary }]} />
              <Text style={[styles.dividerText, { color: theme.icon }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.secondary }]} />
            </View> */}

            {/* Google Sign In */}
            {/* <TouchableOpacity
              onPress={signInWithGoogle}
              style={[styles.googleButton, { borderColor: theme.secondary, backgroundColor: theme.background }]}
            >
              <Ionicons name="logo-google" size={20} color={theme.info} />
              <Text style={[styles.googleButtonText, { color: theme.foreground }]}>
                Continue with Google
              </Text>
            </TouchableOpacity> */}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={[styles.signUpText, { color: theme.icon }]}> 
              {"Don't have an account? "}
              <Text
                style={[styles.signUpLink, { color: theme.foreground }]}
                onPress={handleSignUp}
              >
                Sign Up
              </Text>
            </Text>
          </View>

        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
        justifyContent: 'center',

    flexGrow: 1,
  },
  container: {
    flex: 1,
        justifyContent: 'center', // Centers vertically

    paddingHorizontal: 24,
    paddingVertical: 32,
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 48,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginForm: {
    flex: 1,
    gap: 24,
        width: '100%',

  },
  welcomeHeader: {
    alignItems: 'center',
  },
  welcomeTitle: {
    paddingTop:12,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputFields: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signUpSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontWeight: '600',
  },
});
