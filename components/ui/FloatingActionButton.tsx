import { useNativeTabsBottomGutter } from '@/hooks/useNativeTabsBottomGutter';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

/**
 * FloatingActionButton - Cross-platform floating action button with consistent positioning
 * 
 * This component automatically handles different device types and navigation styles:
 * - iOS devices with different safe areas (notch, home indicator, etc.)
 * - Android devices with different navigation (gesture, 3-button, etc.)
 * - Tablets and landscape orientations
 * 
 * Usage:
 * ```tsx
 * <FloatingActionButton
 *   onPress={() => console.log('Pressed!')}
 *   icon="add"
 *   loading={isLoading}
 * />
 * ```
 * 
 * For scroll content, use useNativeTabsBottomGutter in your ScrollView:
 * ```tsx
 * const { bottomGutter } = useNativeTabsBottomGutter({ extra: 20 });
 * <ScrollView contentContainerStyle={{ paddingBottom: bottomGutter }}>
 * ```
 */
interface FloatingActionButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  foregroundColor?: string;
  shadowColor?: string;
  size?: number;
  style?: ViewStyle;
}

export function FloatingActionButton({
  onPress,
  disabled = false,
  loading = false,
  icon = 'checkmark',
  backgroundColor = '#007AFF',
  foregroundColor = '#FFFFFF',
  shadowColor = '#000000',
  size = 56,
  style,
}: FloatingActionButtonProps) {
  const { bottomGutter } = useNativeTabsBottomGutter({ extra: 16 });

  const buttonStyles: ViewStyle[] = [
    styles.floatingButton,
    {
      backgroundColor,
      shadowColor,
      bottom: bottomGutter,
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} size="small" />
      ) : (
        <Ionicons
          name={icon}
          size={Math.round(size * 0.36)} // Proportional icon size
          color={foregroundColor}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
});
