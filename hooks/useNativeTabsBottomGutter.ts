import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useNativeTabsBottomGutter(options?: { extra?: number, iosExtra?: number, androidExtra?: number }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const baseExtra = options?.extra ?? 12;
  const perPlatformExtra = Platform.OS === 'ios' ? (options?.iosExtra ?? baseExtra) : (options?.androidExtra ?? baseExtra);

  // Android fallback accounts for gesture/3-button nav + tab bar
  const androidFallback = 72;

  let base: number;
  
  if (Platform.OS === 'android') {
    base = Math.max(insets.bottom, androidFallback);
    if (insets.bottom < 20) base += 16;
  } else {
    base = insets.bottom;
  }

  const shouldTrustInsetOnly = Platform.OS === 'ios' && (isLandscape || Math.max(width, height) >= 900);

  const bottomGutter = shouldTrustInsetOnly ? insets.bottom + perPlatformExtra : base + perPlatformExtra;


  return { bottomGutter, insets };
}
