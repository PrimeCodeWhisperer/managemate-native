import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title?: string;
}

export default function CustomHeader({ title }: CustomHeaderProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const insets = useSafeAreaInsets();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("./src/screens/");
    setShowOptionsMenu(false);
  };

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
      
      {/* <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionsButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}
          onPress={() => setShowOptionsMenu(true)}
        >
          <IconSymbol size={20} name="ellipsis" color={Colors[colorScheme ?? 'light'].icon} />
        </TouchableOpacity>

        <Modal
          visible={showOptionsMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View
              style={[
                styles.dropdown,
                { backgroundColor: Colors[colorScheme ?? 'light'].background, shadowColor: Colors[colorScheme ?? 'light'].shadow },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={signOut}
              >
                <Text style={[styles.menuText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View> */}
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
  optionsContainer: {
    marginLeft: 'auto',
  },
  optionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingRight: 20,
  },
  dropdown: {
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
  },
});