import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
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
          paddingTop: insets.top+12,
          borderBottomColor: Colors[colorScheme ?? 'light'].secondary,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </TouchableOpacity>

      {title && (
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {title}
        </Text>
      )}

      <View style={styles.placeholder} />
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
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  backContainer: {
    marginLeft: 'auto',
  },
});
