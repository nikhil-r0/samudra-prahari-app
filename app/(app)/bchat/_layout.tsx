// app/(tabs)/chat/_layout.tsx
import { Stack } from 'expo-router';
import { default as React } from 'react';
import { ChatProvider } from '../../../context/ChatProvider'; // Adjust path if needed

export default function ChatLayout() {
  return (
    <ChatProvider>
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="index" options={{ title: 'Mesh Chat' }} />
        <Stack.Screen name="[channel]" options={{ title: 'Channel' }} />
      </Stack>
    </ChatProvider>
  );
}// app/(tabs)/chat/_layout.tsx