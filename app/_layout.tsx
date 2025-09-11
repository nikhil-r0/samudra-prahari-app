import { Stack } from 'expo-router';
import React from 'react';

// This is a simplified root layout for testing purposes.
// It removes the auth flow and directly loads the main app.
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
