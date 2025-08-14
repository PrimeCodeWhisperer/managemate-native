/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#111111';
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    // New palette keys
    background: '#FFFFFF',
    foreground: '#111111',
    primary: '#111111',
    primaryForeground: '#FFFFFF',
    secondary: '#E5E7EB',
    secondaryForeground: '#111111',
    muted: '#D1D5DB',
    mutedForeground: '#9CA3AF',
    info: '#3B82F6',
    infoBackground: '#3B82F620',
    success: '#22C55E',
    successBackground: '#22C55E20',
    warning: '#FBBF24',
    warningBackground: '#FBBF2420',
    destructive: '#EF4444',
    destructiveBackground: '#FEE2E2',
    destructiveMuted: '#F87171',
    shadow: '#000000',
    // Backward compatible keys
    text: '#111111',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // New palette keys
    background: '#000000',
    foreground: '#FFFFFF',
    primary: '#FFFFFF',
    primaryForeground: '#000000',
    secondary: '#1F2937',
    secondaryForeground: '#FFFFFF',
    muted: '#374151',
    mutedForeground: '#9CA3AF',
    info: '#3B82F6',
    infoBackground: '#3B82F620',
    success: '#22C55E',
    successBackground: '#22C55E20',
    warning: '#FBBF24',
    warningBackground: '#FBBF2420',
    destructive: '#EF4444',
    destructiveBackground: '#7F1D1D',
    destructiveMuted: '#F87171',
    shadow: '#000000',
    // Backward compatible keys
    text: '#FFFFFF',
    tint: tintColorDark,
    icon: '#D1D5DB',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
