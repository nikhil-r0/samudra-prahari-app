import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔹 Shark Week Component (Hero Section)
const SharkWeekCard = () => {
  return (
        <ImageBackground
          source={require('@/assets/images/ocean.jpeg')}
          style={sharkStyles.background}
          resizeMode="cover"
        >
          <View style={sharkStyles.overlayCard}>
            <Text style={sharkStyles.title}>Ocean</Text>
            <Text style={sharkStyles.description}>
              Join Us to protect Ocean and also the People near beaches
            </Text>
          </View>
        </ImageBackground>
  );
};

const sharkStyles = StyleSheet.create({
  background: {
    width: '100%',
    height: 350, // fixed height like a hero banner
    justifyContent: "center",
    alignItems: "flex-end",
  },
  wave: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 2, // keep above card
  },
  overlayCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginRight: 20,
    width: "40%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#004AAD",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#1a1a1a",
  },
});

// 🔹 Dashboard Screen
export default function DashboardScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      {/* Scrollable Dashboard Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <SharkWeekCard />
        <Text style={styles.header}>Welcome, Guardian of the Sea</Text>

        {/* Live Coastal Data Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="water" size={22} color="#0077be" />
            <Text style={styles.cardTitle}>Live Coastal Data</Text>
          </View>
          <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tide:</Text>
              <Text style={styles.dataValue}>High at 2:45 PM</Text>
          </View>
          <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Wave Forecast:</Text>
              <Text style={styles.dataValue}>1.2m (Slight)</Text>
          </View>
           <Text style={styles.notice}>Live data coming soon.</Text>
        </View>

        {/* AI Safety & Info Bot Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="robot" size={22} color="#0077be" />
            <Text style={styles.cardTitle}>AI Safety & Info Bot</Text>
          </View>
          <Text style={styles.cardContent}>
              Ask questions like "Is it safe to swim at Marina Beach today?" for real-time safety advice.
          </Text>
          <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Open Chat (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// 🔹 Dashboard Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005a9c',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    backgroundColor: '#d9534f',
    paddingVertical: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#005a9c',
    marginLeft: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#333',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#005a9c',
  },
   notice: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    color: '#888'
  },
  cardContent: {
      fontSize: 16,
      color: '#555',
      lineHeight: 24,
      marginBottom: 15,
  },
  chatButton: {
      backgroundColor: '#f0f8ff',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
  },
  chatButtonText: {
      color: '#0077be',
      fontSize: 16,
      fontWeight: 'bold',
  }
});
