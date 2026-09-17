import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from '@/components/app/AppErrorBoundary';
import { ConfirmDialogHost, PaddingGuideOverlay, ToastHost } from '@/components/ui';
import { detectDeviceLanguage, initI18n } from '@/i18n';
import { queryClient } from '@/services/queryClient';
import { useAppStore } from '@/store/appStore';
import { colors, motion } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 250, fade: true });

// i18n must be ready before the first render; resources are bundled so this is synchronous.
initI18n(useAppStore.getState().language ?? detectDeviceLanguage());

export { AppErrorBoundary as ErrorBoundary };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: motion.screen,
                contentStyle: { backgroundColor: colors.background },
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="index" options={{ animation: 'none' }} />
              <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen
                name="scan/index"
                options={{
                  // iOS sheet with rounded corners and swipe-down to close, as in the reference.
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                  contentStyle: { backgroundColor: colors.primary },
                }}
              />
              <Stack.Screen
                name="scan/analyzing"
                options={{
                  // Regular screen so the sheet dismisses onto it instead of flashing Home.
                  animation: 'fade',
                  gestureEnabled: false,
                  contentStyle: { backgroundColor: colors.primary },
                }}
              />
              <Stack.Screen name="scan/result/[id]" />
              <Stack.Screen name="scan/fix/[id]" options={{ gestureEnabled: false }} />
              <Stack.Screen name="scan/manual" />
              <Stack.Screen name="history/index" />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="profiles/index" />
              <Stack.Screen name="profiles/edit/[section]" />
              <Stack.Screen name="milestones/index" />
              <Stack.Screen name="exercise/new" />
              <Stack.Screen name="weight/index" />
              <Stack.Screen
                name="progress-photos/privacy"
                options={{
                  presentation: 'modal',
                  animation: 'fade',
                  contentStyle: { backgroundColor: colors.appleBlack },
                }}
              />
              <Stack.Screen name="legal/[doc]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="dev/components" options={{ presentation: 'modal' }} />
            </Stack>
            <ToastHost />
            <ConfirmDialogHost />
            <PaddingGuideOverlay />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background } });
