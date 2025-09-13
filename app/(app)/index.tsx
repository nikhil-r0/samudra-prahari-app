import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Demo Data for Marina Beach, Chennai ---
const waveForecastData = [
  { time: '12 PM', height: 0.8, label: 'Calm' },
  { time: '3 PM', height: 1.1, label: 'Slight' },
  { time: '6 PM', height: 1.0, label: 'Slight' },
  { time: '9 PM', height: 0.7, label: 'Calm' },
];

const touristSpots = [
    { name: 'Marina Lighthouse', icon: 'binoculars', description: 'Stunning panoramic views of the city and sea.' },
    { name: 'Vivekananda House', icon: 'landmark', description: 'A historic monument and museum.' },
    { name: 'Anna Memorial', icon: 'monument', description: 'A peaceful memorial on the beach front.' },
];

const localEats = [
    { name: 'Fresh Sundal & Bajji', icon: 'pepper-hot', description: 'Iconic beachside snacks from local vendors.' },
    { name: 'Murugan Idli Shop', icon: 'utensils', description: 'Famous for soft idlis and traditional fare.' },
];

// 🔹 Hero Section Component
const HeroBanner = () => {
  return (
    <View style={heroStyles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1616895993353-e9988a8a3c9b?q=80&w=2070' }}
          style={heroStyles.background}
          resizeMode="cover"
        >
          <View style={heroStyles.overlay} />
          <View style={heroStyles.textContainer}>
            <Text style={heroStyles.title}>Marina Beach Watch</Text>
            <Text style={heroStyles.subtitle}>
              Your guide to Chennai's iconic coastline.
            </Text>
          </View>
        </ImageBackground>
    </View>
  );
};

// 🔹 Dashboard Screen
export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f8ff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBanner />

        {/* Welcome Header */}
        <Text style={styles.header}>Welcome, Guardian of Marina!</Text>

        {/* Report Hazard Button */}
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => router.push('/report')}
        >
            <FontAwesome5 name="exclamation-triangle" size={20} color="white" />
            <Text style={styles.reportButtonText}>Report a Hazard</Text>
        </TouchableOpacity>

        {/* Live Coastal Data Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="water" size={22} color="#0077be" />
            <Text style={styles.cardTitle}>Today's Coastal Data</Text>
          </View>
          <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Tide Status:</Text>
              <Text style={styles.dataValue}>High Tide at 3:15 PM</Text>
          </View>
          <Text style={[styles.dataLabel, { marginTop: 10, marginBottom: 5 }]}>Wave Forecast:</Text>
          <View style={styles.waveContainer}>
            {waveForecastData.map((wave, index) => (
                <View key={index} style={styles.waveItem}>
                    <Text style={styles.waveTime}>{wave.time}</Text>
                    <View style={[styles.waveBar, { height: wave.height * 30 }]} />
                    <Text style={styles.waveHeight}>{wave.height}m</Text>
                </View>
            ))}
          </View>
        </View>
        
        {/* Tourist Guide Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="map-marked-alt" size={22} color="#0077be" />
            <Text style={styles.cardTitle}>Marina Explorer's Guide</Text>
          </View>
          
          <Text style={styles.guideSubtitle}>Nearby Attractions</Text>
          {touristSpots.map((spot, index) => (
            <View key={index} style={styles.guideItem}>
                <FontAwesome5 name={spot.icon as any} size={20} color="#005a9c" />
                <View style={styles.guideTextContainer}>
                    <Text style={styles.guideItemTitle}>{spot.name}</Text>
                    <Text style={styles.guideItemDesc}>{spot.description}</Text>
                </View>
            </View>
          ))}

          <Text style={styles.guideSubtitle}>Must-Try Local Food</Text>
           {localEats.map((eat, index) => (
            <View key={index} style={styles.guideItem}>
                <FontAwesome5 name={eat.icon as any} size={20} color="#005a9c" />
                <View style={styles.guideTextContainer}>
                    <Text style={styles.guideItemTitle}>{eat.name}</Text>
                    <Text style={styles.guideItemDesc}>{eat.description}</Text>
                </View>
            </View>
          ))}
        </View>

        {/* AI Safety & Info Bot Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="robot" size={22} color="#0077be" />
            <Text style={styles.cardTitle}>AI Safety & Info Bot</Text>
          </View>
          <Text style={styles.cardContent}>
              Ask "Is swimming allowed at Marina Beach now?" for real-time safety alerts.
          </Text>
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/chat')}>
              <Text style={styles.chatButtonText}>Open Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// 🔹 Hero Styles
const heroStyles = StyleSheet.create({
    container: {
        height: 250,
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        elevation: 5,
        backgroundColor: '#005a9c',
    },
    background: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 50, 90, 0.5)',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginTop: 8,
    },
});

// 🔹 Dashboard Styles
const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#005a9c',
    marginVertical: 25,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    backgroundColor: '#d9534f',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#d9534f',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  reportButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
    marginLeft: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005a9c',
  },
  waveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    backgroundColor: '#e6f2ff',
    borderRadius: 10,
    paddingTop: 10,
  },
  waveItem: {
    alignItems: 'center',
    flex: 1,
  },
  waveTime: {
    fontSize: 12,
    color: '#005a9c',
  },
  waveBar: {
    width: 25,
    backgroundColor: '#0077be',
    borderRadius: 5,
    marginTop: 5,
  },
  waveHeight: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#005a9c',
    marginTop: 4,
  },
  guideSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  guideTextContainer: {
    marginLeft: 15,
  },
  guideItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005a9c',
  },
  guideItemDesc: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
      fontSize: 16,
      color: '#555',
      lineHeight: 24,
      marginBottom: 15,
  },
  chatButton: {
      backgroundColor: '#e6f2ff',
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

