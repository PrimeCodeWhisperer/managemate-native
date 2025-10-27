import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceType } from './useDeviceType';

export function useNativeTabsTopGutter(options?: { extra?: number, iosExtra?: number, androidExtra?: number }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { isTablet } = useDeviceType();

  const baseExtra = options?.extra ?? 12;
  const perPlatformExtra = Platform.OS === 'ios' ? (options?.iosExtra ?? baseExtra) : (options?.androidExtra ?? baseExtra);

  // Android fallback accounts for gesture/3-button nav + tab bar
  const androidFallback = 72;

  let base: number;
  
  if (Platform.OS === 'android') {
    base = Math.max(insets.top, androidFallback);
    if (insets.top < 20) base += 16;
  } else {
    base = insets.top;
  }

  const shouldTrustInsetOnly = Platform.OS === 'ios' && (isLandscape || Math.max(width, height) >= 900);

  const topGutter = !isTablet ? options?.extra ? options?.extra :0: shouldTrustInsetOnly ? insets.top + perPlatformExtra : base + perPlatformExtra;


  return { topGutter, insets };
}
