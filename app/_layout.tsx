import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { Provider } from '@/components/Provider';

export default function RootLayout() {
  return (
    <Provider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="templates" />
        <Stack.Screen name="history" />
        <Stack.Screen name="analysis" />
        <Stack.Screen name="result" />
        <Stack.Screen name="benchmark" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="search" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="trends" />
        <Stack.Screen name="auth-login" />
        <Stack.Screen name="auth-register" />
        <Stack.Screen name="auth-forgot-password" />
      </Stack>
    </Provider>
  );
}
