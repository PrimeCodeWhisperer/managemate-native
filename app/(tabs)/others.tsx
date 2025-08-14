import ProfileSkeleton from '@/components/common/ProfileSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/supabase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: 'default' | 'danger';
}

export default function OthersScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const { profile, loading, error, refresh } = useProfile();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              // Navigation will be handled by your auth context
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'account',
      title: 'Account Settings',
      subtitle: 'Manage your profile and preferences',
      icon: 'person-circle-outline',
      onPress: () => Alert.alert('Coming Soon', 'Account settings will be available soon'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Configure notification settings',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    },
    {
      id: 'timeoff',
      title: 'Time Off Requests',
      subtitle: 'Submit and track vacation requests',
      icon: 'calendar-clear-outline',
      onPress: () => Alert.alert('Coming Soon', 'Time off requests will be available soon'),
    },
    {
      id: 'payroll',
      title: 'Payroll',
      subtitle: 'View pay stubs and tax documents',
      icon: 'card-outline',
      onPress: () => Alert.alert('Coming Soon', 'Payroll information will be available soon'),
    },
    {
      id: 'team',
      title: 'Team Directory',
      subtitle: 'View colleagues and contact info',
      icon: 'people-outline',
      onPress: () => Alert.alert('Coming Soon', 'Team directory will be available soon'),
    },
    {
      id: 'reports',
      title: 'Reports',
      subtitle: 'View work analytics and insights',
      icon: 'analytics-outline',
      onPress: () => Alert.alert('Coming Soon', 'Reports will be available soon'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get assistance and FAQs',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Coming Soon', 'Help & support will be available soon'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'Review data usage and policies',
      icon: 'shield-checkmark-outline',
      onPress: () => Alert.alert('Coming Soon', 'Privacy policy will be available soon'),
    },
    {
      id: 'version',
      title: 'App Version',
      subtitle: 'Version 2.1.4',
      icon: 'phone-portrait-outline',
    },
  ];

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.username) {
      return profile.username;
    }
    return 'User';
  };

  const getEmployeeId = () => {
    if (profile?.id) {
      return `MM${profile.id.slice(-4).toUpperCase()}`;
    }
    return 'MM****';
  };

  const getAvatarSource = () => {
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url };
    }
    // Default avatar fallback
    return { uri: 'https://via.placeholder.com/100/E5E7EB/9CA3AF?text=U' };
  };

  if (error) {
    return (
      <ErrorBoundary>
        <ThemedView style={styles.container}>
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
      <ThemedView style={styles.container}>

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContentContainer}
      >
        {/* Profile Section */}
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <TouchableOpacity
            style={[styles.profileSection, { backgroundColor: theme.secondary }]}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
          >
            <Image
              source={getAvatarSource()}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>
                {getDisplayName()}
              </ThemedText>
              <Text style={[styles.profileId, { color: theme.icon }]}>
                Employee ID: {getEmployeeId()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.icon} />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.secondary,
                  shadowColor: theme.shadow,
                },
              ]}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: theme.secondary }]}>
                  <Ionicons name={item.icon} size={20} color={theme.foreground} />
                </View>
                <View style={styles.menuItemText}>
                  <ThemedText style={styles.menuItemTitle}>
                    {item.title}
                  </ThemedText>
                  <Text style={[styles.menuItemSubtitle, { color: theme.icon }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              {item.onPress && (
                <Ionicons name="chevron-forward" size={16} color={theme.icon} />
              )}
            </TouchableOpacity>
          ))}

          {/* Sign Out Button */}
          <TouchableOpacity
            style={[
              styles.signOutButton,
              styles.menuItem,
              {
                borderColor: theme.destructiveBackground,
                backgroundColor: theme.destructiveBackground,
                shadowColor: theme.shadow,
              },
            ]}
            onPress={handleSignOut}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.signOutIcon, { backgroundColor: theme.destructiveBackground }]}>
                <Ionicons name="log-out-outline" size={20} color={theme.destructive} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[styles.signOutTitle, { color: theme.destructive }]}>
                  Sign Out
                </Text>
                <Text style={[styles.signOutSubtitle, { color: theme.destructiveMuted }]}>
                  Log out of your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.destructive} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
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
  },
  headerLeft: {
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainContentContainer: {
    paddingVertical: 24,
    paddingBottom: 100, // Account for bottom navigation
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileId: {
    fontSize: 14,
    marginTop: 2,
  },
  menuItems: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  signOutButton: {
    marginTop: 24,
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  signOutTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});