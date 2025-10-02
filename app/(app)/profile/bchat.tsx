// components/BitchatTestScreen.js
import BitchatAPI, { BitchatMessage } from 'expo-bitchat';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// A unique nickname for this device
const NICKNAME = `User-${Math.floor(Math.random() * 1000)}`;

// Helper function to request permissions on Android
const requestBlePermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const ANDROID_VERSION = Platform.Version as number;

  if (ANDROID_VERSION >= 31) {
    // Android 12 (API 31) and above
    const res = await PermissionsAndroid.requestMultiple([
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION',
    ]);
    
    const isGranted =
      res['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
      res['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
      res['android.permission.ACCESS_FINE_LOCATION'] === 'granted';

    if (!isGranted) {
      Alert.alert(
        'Permissions Required',
        'Bluetooth and Location permissions are needed for chat on Android 12+.'
      );
    }
    return isGranted;

  } else {
    // Android 11 (API 30) and below
    const res = await PermissionsAndroid.request(
      'android.permission.ACCESS_FINE_LOCATION'
    );
    
    const isGranted = res === 'granted';

    if (!isGranted) {
      Alert.alert(
        'Permission Required',
        'Location permission is needed for Bluetooth scanning on older Android.'
      );
    }
    return isGranted;
  }
};

export default function BitchatTestScreen() {
  const [peers, setPeers] = useState({});
  // FIX: Explicitly type the state as an array of BitchatMessage objects
  const [messages, setMessages] = useState<BitchatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const channel = '#general'; // Default channel for testing

  useEffect(() => {
    const subscriptions = [];

    const initializeBitchat = async () => {
      const permissionsGranted = await requestBlePermissions();
      if (!permissionsGranted) return;

      await BitchatAPI.startServices(NICKNAME);
      console.log('Bitchat service started with nickname:', NICKNAME);

      const initialPeers = await BitchatAPI.getConnectedPeers();
      setPeers(initialPeers);

      subscriptions.push(
        BitchatAPI.addPeerConnectedListener(({ peerID, nickname }) => {
          console.log(`${nickname} connected`);
          setPeers((prevPeers) => ({ ...prevPeers, [peerID]: nickname }));
        })
      );

      subscriptions.push(
        BitchatAPI.addPeerDisconnectedListener(({ peerID }) => {
          console.log(`Peer ${peerID} disconnected`);
          setPeers((prevPeers) => {
            const newPeers = { ...prevPeers };
            delete newPeers[peerID];
            return newPeers;
          });
        })
      );

      subscriptions.push(
        BitchatAPI.addMessageListener((message) => {
          console.log('Received message:', message);
          setMessages((prevMessages) => [...prevMessages, message]);
        })
      );
    };

    initializeBitchat();

    return () => {
      subscriptions.forEach((sub) => sub.remove());
      BitchatAPI.stopServices();
      console.log('Bitchat services stopped.');
    };
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim().length > 0) {
      BitchatAPI.sendMessage(inputText, [], channel);
      setInputText('');
    }
  };

  const peerList = Object.entries(peers);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bitchat Test</Text>
      <Text style={styles.peerId}>My Nickname: {NICKNAME}</Text>

      <Text style={styles.subHeader}>Connected Peers ({peerList.length}):</Text>
      <ScrollView style={styles.list}>
        {peerList.length > 0 ? (
          peerList.map(([peerID, nickname]) => (
            <Text key={peerID}>{`${nickname} (${peerID.slice(0, 6)}...)`}</Text>
          ))
        ) : (
          <Text>Scanning for peers...</Text>
        )}
      </ScrollView>

      <Text style={styles.subHeader}>Messages:</Text>
      <ScrollView style={styles.list}>
        {messages.map((msg, index) => (
          <Text key={index}>{`${msg.sender}: ${msg.content}`}</Text>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Message ${channel}`}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  peerId: { marginBottom: 15, fontStyle: 'italic', color: '#555', textAlign: 'center' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  list: {
    flex: 1,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: 'white',
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});