import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import '../global.css';
import CustomHeader from '@/components/CustomHeader';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGate />
    </ThemeProvider>
  );
}

function AuthGate() {
  const pathname = usePathname();
  const [session, setSession] = React.useState<import('@supabase/supabase-js').Session | null>(null);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setInitializing(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (initializing) return null;

  const onLoginRoute = pathname === '/login';
  if (!session && !onLoginRoute) return <Redirect href="/login" />;
  if (session && onLoginRoute) return <Redirect href="/(tabs)" />;

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerTitle: 'Login' }} />
        <Stack.Screen name="open-shifts" options={{ header: () => <CustomHeader title="Open Shifts" /> }} />
        <Stack.Screen name="vacations" options={{ header: () => <CustomHeader title="Vacations" /> }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
