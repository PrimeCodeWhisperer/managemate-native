import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceType } from './useDeviceType';

export function useNativeTabsTopGutter(options?: { extra?: number, iosExtra?: number, androidExtra?: number }) {
  const insets = useSafeAreaInsets();
  const { isTablet } = useDeviceType();

  const baseExtra = options?.extra ?? 12;

  // Android fallback accounts for gesture/3-button nav + tab bar
  const androidFallback = 72;

  let base: number;
  
  if (Platform.OS === 'android') {
    base = Math.max(insets.top, androidFallback);
    if (insets.top < 20) base += 16;
  } else {
    base = insets.top+16;
  }


  const topGutter = !isTablet ? options?.extra ? options?.extra :0: base + baseExtra;


  return { topGutter, insets };
}
