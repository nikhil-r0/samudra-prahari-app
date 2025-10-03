import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Function to send a test notification
async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Samudra Prahari Test 🌊',
    body: 'This is a test notification from your app!',
    data: { testData: 'This is a test.' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

export default function ProfileScreen() {
  // FIX: Destructure expoPushToken from the useAuth hook
  const { user, updateProfileWithNotifications, expoPushToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This will run when the profile screen is opened
    updateProfileWithNotifications();
  }, []);

  // FIX: Add the handleTestNotification function
  const handleTestNotification = async () => {
    if (expoPushToken) {
      await sendPushNotification(expoPushToken);
      Alert.alert('Notification Sent!', 'Check your device notifications.');
    } else {
      Alert.alert('No Push Token', 'Could not send notification. Is the push token available?');
    }
  };


  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out: ' + error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while signing out');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 20}}>
        <View style={styles.header}>
          <FontAwesome5 name="user-circle" size={80} color="#005a9c" />
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || 'Guardian of the Sea'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'citizen@samudraprahari.org'}
          </Text>
        </View>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <FontAwesome5 name="user-edit" size={20} color="#333" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(app)/profile/history")}>
            <FontAwesome5 name="clock" size={20} color="#333" />
            <Text style={styles.menuItemText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(app)/profile/bchat")}>
            <FontAwesome5 name="comment-alt" size={20} color="#333" />
            <Text style={styles.menuItemText}>Bluetooth Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("https://www.google.com/maps/?q=12.9767,77.5713")}>
            <FontAwesome5 name="map" size={20} color="#333" />
            <Text style={styles.menuItemText}>Escape Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} >
            <FontAwesome5 name="question-circle" size={20} color="#333" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </TouchableOpacity>
          {/* Add the Test Notification Button */}
          {expoPushToken && (
             <TouchableOpacity style={styles.menuItem} onPress={handleTestNotification}>
                <FontAwesome5 name="bell" size={20} color="#333" />
                <Text style={styles.menuItemText}>Test Notification</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005a9c',
    marginTop: 15,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menu: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 20,
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
