import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
// 1. Import the hook
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  // 2. Get the safe area insets
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0077be',
        tabBarInactiveTintColor: '#9e9e9e',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          // 3. Apply the bottom inset to the height and padding
          // We add the original height (60) to the inset value
          height: 60 + insets.bottom, 
          // We add the original padding (5) to the inset value
          paddingBottom: 5 + insets.bottom,
        },
        headerStyle: {
          backgroundColor: '#f0f8ff',
        },
        headerTitleStyle: {
          color: '#005a9c',
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report Hazard',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="exclamation-triangle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="history" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user-alt" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}