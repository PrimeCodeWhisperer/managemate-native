import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

export default function TabLayout() {
  const labelColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: 'black', dark: 'white' })
      : '#666666';

  return (
    <NativeTabs
      // Helps avoid a transparent bar on iOS with scroll views
      disableTransparentOnScrollEdge
      // Give a non-transparent indicator so you can verify selection
      indicatorColor="#007AFF33"
      // Explicit label + icon tinting so it’s visible even without liquid
      labelStyle={{ color: labelColor }}
      tintColor={
        Platform.OS === 'ios'
          ? DynamicColorIOS({ light: '#007AFF', dark: '#0A84FF' })
          : '#007AFF'
      }
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <Icon sf="calendar" />
        <Label>Schedule</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timesheet">
        <Icon sf="clock" />
        <Label>Timesheet</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="availability">
        <Icon sf="person" />
        <Label>Availability</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="others">
        <Icon sf="ellipsis" />
        <Label>Others</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
