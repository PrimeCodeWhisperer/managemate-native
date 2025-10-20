import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger
        name="index"
      >
      <Label>Home</Label>
      <Icon sf='house'/>
      </NativeTabs.Trigger>
            <NativeTabs.Trigger
        name="schedule"
      >
      <Label>Schedule</Label>
      <Icon sf='calendar'/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="timesheet"
      >
      <Label>Timesheet</Label>
      <Icon sf='clock'/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="availability"
      >
      <Label>Availability</Label>
      <Icon sf='person'/>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="others"
      >
      <Label>Others</Label>
      <Icon sf='ellipsis'/>
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
