import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Updated data to reflect beach hazards and alerts
const mockAlerts = [
  {
    id: '1',
    type: 'High Tide Warning',
    status: 'Active',
    date: '2025-09-13',
  },
  {
    id: '2',
    type: 'Rip Current Advisory',
    status: 'Expired',
    date: '2025-09-12',
  },
  {
    id: '3',
    type: 'Thunderstorm Watch',
    status: 'Forecasted',
    date: '2025-09-14',
  },
  {
    id: '4',
    type: 'Tsunami Alert',
    status: 'Expired',
    date: '2025-08-28',
  },
    {
    id: '5',
    type: 'Strong Winds Forecast',
    status: 'Active',
    date: '2025-09-13',
  },
];

// Updated styling for new alert statuses
const getAlertStyle = (status: string) => {
  switch (status) {
    case 'Active':
      return {
        borderColor: '#dc3545', // Red for active danger
        color: '#dc3545',
        backgroundColor: '#f8d7da',
      };
    case 'Forecasted':
      return {
        borderColor: '#ffc107', // Yellow for caution/forecast
        color: '#b88100',
        backgroundColor: '#fff8e1',
      };
    case 'Expired':
       return {
        borderColor: '#6c757d', // Grey for past events
        color: '#6c757d',
        backgroundColor: '#f8f9fa',
      };
    default:
      return { borderColor: '#6c757d', color: '#6c757d' };
  }
};

// Helper to get a specific icon and color for each hazard type
const getHazardIcon = (type: string) => {
    switch(type) {
        case 'High Tide Warning':
            return { name: 'water', color: '#0077be' };
        case 'Rip Current Advisory':
            return { name: 'swimmer', color: '#ff8c00' };
        case 'Thunderstorm Watch':
            return { name: 'bolt', color: '#6a0dad' };
        case 'Tsunami Alert':
            return { name: 'exclamation-triangle', color: '#b22222' };
        case 'Strong Winds Forecast':
            return { name: 'wind', color: '#546e7a' };
        default:
            return { name: 'info-circle', color: '#0077be' };
    }
}

const HazardItem = ({ item }: { item: typeof mockAlerts[0] }) => {
  const alertStyle = getAlertStyle(item.status);
  const hazardIcon = getHazardIcon(item.type);
  return (
    <View style={styles.reportItem}>
        <FontAwesome5 name={hazardIcon.name} size={24} color={hazardIcon.color} style={styles.icon}/>
        <View style={styles.reportDetails}>
            <Text style={styles.reportType}>{item.type}</Text>
            <Text style={styles.reportDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, {borderColor: alertStyle.borderColor, backgroundColor: alertStyle.backgroundColor}]}>
            <Text style={[styles.statusText, {color: alertStyle.color}]}>{item.status}</Text>
        </View>
    </View>
  );
};

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
     <Text style={styles.title}>Hazard History & Forecasts</Text>
      <FlatList
        data={mockAlerts}
        renderItem={({ item }) => <HazardItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005a9c',
    textAlign: 'center',
    paddingVertical: 20,
  },
  list: {
    paddingHorizontal: 15,
  },
  reportItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  icon: {
      marginRight: 15,
      width: 25, // Ensures consistent alignment
      textAlign: 'center',
  },
  reportDetails: {
      flex: 1,
  },
  reportType: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  reportDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
