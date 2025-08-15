import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomHeader from '@/components/CustomHeader';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        header: ({ route, options }) => <CustomHeader title={options.title as string} />,
        tabBarActiveTintColor: theme.foreground,
        tabBarInactiveTintColor: theme.mutedForeground,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.secondary,
          borderTopWidth: 1,
          paddingBottom: Platform.select({
            ios: Math.max(insets.bottom - 10, 0),
            android: 5,
            default: 5,
          }),
          paddingTop: 0, // Remove any top padding
          height: Platform.select({
            ios: 60 + Math.max(insets.bottom - 10, 0),
            android: 60+ Math.max(insets.bottom - 5, 0),
            default: 60,
          }),
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarItemStyle: {
          paddingTop: 8, // Control individual tab item spacing
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Managemate',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="home"
              size={20}
              color={focused ? theme.foreground : theme.mutedForeground}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="calendar"
              size={20}
              color={focused ? theme.foreground : theme.mutedForeground}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timesheet"
        options={{
          title: 'Timesheet',
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="clock-o"
              size={20}
              color={focused ? theme.foreground : theme.mutedForeground}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Availability',
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="user"
              size={20}
              color={focused ? theme.foreground : theme.mutedForeground}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="others"
        options={{
          title: 'Other',
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="ellipsis-h"
              size={20}
              color={focused ? theme.foreground : theme.mutedForeground}
            />
          ),
        }}
      />
    </Tabs>
  );
}