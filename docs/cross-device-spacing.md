# Cross-Device Spacing Guidelines

## Problem Statement

React Native apps often struggle with consistent spacing across different devices and platforms:
- iOS devices have varying safe areas (notch, Dynamic Island, home indicator)
- Android devices use different navigation styles (gesture, 3-button)
- Tablets and landscape orientations introduce additional complexity
- Manual calculations like `insets.bottom * 2` create inconsistent results

## Solution: useNativeTabsBottomGutter Hook

This project includes a specialized hook designed to handle cross-platform bottom spacing consistently.

### When to Use

✅ **Use `useNativeTabsBottomGutter` for:**
- Floating Action Buttons
- Bottom floating panels/pills
- Scroll view content padding
- Any element that needs to sit above the tab bar

❌ **Don't use manual calculations like:**
- `insets.bottom * 2`
- `insets.bottom + 56`
- Hardcoded values like `paddingBottom: 100`

### Implementation Examples

#### Floating Action Button
```tsx
import { useNativeTabsBottomGutter } from '@/hooks/useNativeTabsBottomGutter';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

function MyScreen() {
  // The FloatingActionButton component handles this automatically
  return (
    <FloatingActionButton
      onPress={() => console.log('Pressed!')}
      icon="checkmark"
    />
  );
}
```

#### Custom Floating Elements
```tsx
function MyScreen() {
  const { bottomGutter } = useNativeTabsBottomGutter({ extra: 16 });
  
  return (
    <View style={{ bottom: bottomGutter }}>
      {/* Your floating content */}
    </View>
  );
}
```

#### Scroll View Content Padding
```tsx
function MyScreen() {
  const { bottomGutter } = useNativeTabsBottomGutter({ extra: 20 });
  
  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: bottomGutter,
      }}
    >
      {/* Your content */}
    </ScrollView>
  );
}
```

### How It Works

The hook automatically:
1. **iOS**: Uses safe area insets, with special handling for iPads and landscape
2. **Android**: Falls back to 56px when safe area is insufficient (3-button nav)
3. **Tablets**: Adjusts behavior for large screens and different orientations
4. **Consistent**: Adds configurable extra padding for your specific needs

### Migration Checklist

When updating existing code:

- [ ] Replace `insets.bottom * N` with `useNativeTabsBottomGutter()`
- [ ] Remove hardcoded bottom padding values
- [ ] Test on both iOS and Android devices
- [ ] Test with different navigation styles (gesture vs 3-button on Android)
- [ ] Test in landscape orientation
- [ ] Verify floating elements don't overlap with tab bar

### Best Practices

1. **Use the FloatingActionButton component** for standard FABs
2. **Always test cross-platform** - what works on iOS might not work on Android
3. **Consider the extra parameter** - adjust based on your content needs
4. **Don't hardcode spacing** - let the hook handle device differences

### Troubleshooting

**Problem**: Floating button still too close to bottom on Android
- **Solution**: Increase the `extra` parameter in `useNativeTabsBottomGutter({ extra: 20 })`

**Problem**: Too much space on iOS
- **Solution**: The hook should handle this automatically, but you can decrease `extra` if needed

**Problem**: Issues in landscape mode
- **Solution**: The hook includes landscape detection - ensure you're using the latest version

### Components Using This Pattern

- `FloatingActionButton` - Automatic cross-device FAB positioning
- `availability.tsx` - Uses hook for scroll padding and FAB
- `timesheet.tsx` - Uses hook for floating summary pill + FAB

This approach ensures your app looks and feels native across all devices while maintaining consistent spacing and avoiding platform-specific issues.
