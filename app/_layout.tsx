import { Stack } from 'expo-router';
import { SessionProvider } from '../lib/ctx';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="sign_in" options={{ title: 'Sign In' }} />
      </Stack>
    </SessionProvider>
  );
}
