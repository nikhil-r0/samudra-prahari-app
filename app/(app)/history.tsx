import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder data for report history
const mockReports = [
  {
    id: '1',
    type: 'Oil Spill',
    status: 'Submitted',
    date: '2023-10-27',
  },
  {
    id: '2',
    type: 'Plastic Debris',
    status: 'Queued for Upload',
    date: '2023-10-26',
  },
  {
    id: '3',
    type: 'Illegal Fishing',
    status: 'Received',
    date: '2023-10-25',
  },
  {
    id: '4',
    type: 'Damaged Coral',
    status: 'Submitted',
    date: '2023-10-22',
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Submitted':
      return {
        borderColor: '#28a745',
        color: '#28a745',
        backgroundColor: '#eaf6ec',
      };
    case 'Queued for Upload':
      return {
        borderColor: '#ffc107',
        color: '#b88100',
        backgroundColor: '#fff8e1',
      };
    case 'Received':
       return {
        borderColor: '#007bff',
        color: '#007bff',
        backgroundColor: '#e6f2ff',
      };
    default:
      return { borderColor: '#6c757d', color: '#6c757d' };
  }
};

const ReportItem = ({ item }: { item: typeof mockReports[0] }) => {
  const statusStyle = getStatusStyle(item.status);
  return (
    <View style={styles.reportItem}>
        <FontAwesome5 name="exclamation-triangle" size={24} color="#0077be" style={styles.icon}/>
        <View style={styles.reportDetails}>
            <Text style={styles.reportType}>{item.type}</Text>
            <Text style={styles.reportDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, {borderColor: statusStyle.borderColor, backgroundColor: statusStyle.backgroundColor}]}>
            <Text style={[styles.statusText, {color: statusStyle.color}]}>{item.status}</Text>
        </View>
    </View>
  );
};

export default function HistoryScreen() {
  return (
    // It's good practice to wrap screen content in a View or SafeAreaView
    <SafeAreaView style={styles.container}>
     <Text style={styles.title}>My Report History</Text>
      <FlatList
        data={mockReports}
        // FIX: Wrap ReportItem in an arrow function
        renderItem={({ item }) => <ReportItem item={item} />}
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
  },
  reportDetails: {
      flex: 1,
  },
  reportType: {
    fontSize: 18,
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
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});