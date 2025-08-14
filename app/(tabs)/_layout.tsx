import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

import CustomHeader from '@/components/CustomHeader';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
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