import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../lib/ctx';

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) return null;

  if (!session) {
    return <Redirect href='/sign_in' />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="open-shifts" options={{ title: 'Open Shifts' }} />
      <Stack.Screen name="vacations" options={{ title: 'Vacations' }} />
    </Stack>
  );
}
