import { Entypo } from '@expo/vector-icons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

export default function TabLayout() {
  const labelColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: 'black', dark: 'white' })
      : '#666666';

  return (
    <NativeTabs
      blurEffect='systemDefault'
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
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: <Icon src={<VectorIcon family={Entypo} name="home" />} />,
        })}
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        {Platform.select({
          ios: <Icon sf="calendar" />,
          android: <Icon src={<VectorIcon family={Entypo} name="calendar" />} />,
        })}
        <Label>Schedule</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timesheet">
        {Platform.select({
          ios: <Icon sf="clock.fill" />,
          android: <Icon src={<VectorIcon family={Entypo} name="clock" />} />,
        })}
        <Label>Timesheet</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="availability">
        {Platform.select({
          ios: <Icon sf="person.fill" />,
          android: <Icon src={<VectorIcon family={Entypo} name="user" />} />,
        })}
        <Label>Availability</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="others">
        {Platform.select({
          ios: <Icon sf="ellipsis" />,
          android: <Icon src={<VectorIcon family={Entypo} name="dots-three-horizontal" />} />,
        })}
        <Label>Others</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
