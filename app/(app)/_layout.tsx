import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
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
          height: 60 + insets.bottom, 
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
       {/* This screen is hidden from the tab bar but can be navigated to */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Safety Bot',
          href: null, // Hides this screen from the tab bar
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

