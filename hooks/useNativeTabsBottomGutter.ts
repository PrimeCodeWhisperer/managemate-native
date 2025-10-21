import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useNativeTabsBottomGutter(options?: { extra?: number }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const extra = options?.extra ?? 12;

  // Heuristics:
  // - iOS: rely on safe area; when the tab bar moves (iPad/landscape), this is near 0 and that's correct.
  // - Android: fall back to 56 when there is no inset (3-button nav / some devices).
  const androidFallback = 56;

  const base =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, androidFallback)
      : insets.bottom;

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
