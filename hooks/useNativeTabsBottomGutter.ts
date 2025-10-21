import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useNativeTabsBottomGutter(options?: { extra?: number }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const extra = options?.extra ?? 12;

  // More aggressive Android fallback - many Android devices report 0 safe area
  // but still need space for navigation + tab bar
  const androidFallback = 72; // Increased from 56 to account for tab bar + navigation

  let base: number;
  
  if (Platform.OS === 'android') {
    // For Android, be more aggressive with spacing
    // Use whichever is larger: safe area insets or our fallback
    base = Math.max(insets.bottom, androidFallback);
    
    // If we're using the fallback (meaning insets.bottom is small/zero),
    // add extra spacing to ensure proper clearance
    if (insets.bottom < 20) {
      base += 16; // Additional padding for devices with minimal safe area reporting
    }
  } else {
    // iOS - rely on safe area insets as they're usually accurate
    base = insets.bottom;
  }

  // On large iPads / Vision-style layouts the tabs can move away from the bottom;
  // when landscape + big screens, prefer the inset (often 0) without adding fallback.
  const shouldTrustInsetOnly =
    Platform.OS === 'ios' && (isLandscape || Math.max(width, height) >= 900);

  const bottomGutter = shouldTrustInsetOnly ? insets.bottom + extra : base + extra;

  // Debug logging to help troubleshoot cross-device issues
  if (__DEV__) {
    console.log('useNativeTabsBottomGutter Debug:', {
      platform: Platform.OS,
      insetsBottom: insets.bottom,
      androidFallback,
      base,
      extra,
      shouldTrustInsetOnly,
      finalBottomGutter: bottomGutter,
      screenDimensions: { width, height },
      isLandscape
    });
  }

  return { bottomGutter, insets };
}
