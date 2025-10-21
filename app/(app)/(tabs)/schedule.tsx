import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DATA = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i + 1),
  title: `Shift ${i + 1}`,
  time: '09:00 - 17:00',
}));

export default function Schedule() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  row: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  title: { fontSize: 16, fontWeight: '600' },
  time: { marginTop: 4, color: '#8E8E93' },
});
