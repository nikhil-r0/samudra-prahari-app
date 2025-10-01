import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
      <ScrollView >
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
    marginTop: 40,
    marginBottom: 40,
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
    width: '90%',
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
    paddingHorizontal: 50,
    borderRadius: 10,
    elevation: 2,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
