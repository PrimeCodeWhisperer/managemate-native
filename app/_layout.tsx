import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import { SessionProvider } from '../lib/ctx';

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  return (
    <SessionProvider>
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
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="sign_in"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SessionProvider>
  );
}
