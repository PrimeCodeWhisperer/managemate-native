import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import CustomHeader from '@/components/CustomHeader';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: ({ route, options }) => <CustomHeader title={options.title as string} />,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
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
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Managemate',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              name="home" 
              size={20} 
              color={focused ? '#000000' : '#9CA3AF'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              name="calendar" 
              size={20} 
              color={focused ? '#000000' : '#9CA3AF'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timesheet"
        options={{
          title: 'Timesheet',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              name="clock-o" 
              size={20} 
              color={focused ? '#000000' : '#9CA3AF'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Availability',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              name="user" 
              size={20} 
              color={focused ? '#000000' : '#9CA3AF'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="others"
        options={{
          title: 'Other',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              name="ellipsis-h" 
              size={20} 
              color={focused ? '#000000' : '#9CA3AF'} 
            />
          ),
        }}
      />
    </Tabs>
  );
}