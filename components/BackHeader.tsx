import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BackHeaderProps {
  title?: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          paddingTop: insets.top,
          borderBottomColor: Colors[colorScheme ?? 'light'].secondary,
        },
      ]}
    >
      {title && (
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {title}
        </Text>
      )}

      <View style={styles.backContainer}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}
          onPress={() => router.back()}
        >
          <IconSymbol size={20} name="arrow.left" color={Colors[colorScheme ?? 'light'].icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  backContainer: {
    marginLeft: 'auto',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
