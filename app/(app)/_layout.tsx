import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../lib/ctx';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  if (isLoading) return null;

  if (!session) {
    return <Redirect href='/sign_in' />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.foreground,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: '' }} />
      <Stack.Screen name="open-shifts" options={{ title: 'Open Shifts' }} />
      <Stack.Screen name="vacations" options={{ title: 'Vacations' }} />
    </Stack>
  );
}
