// app/(tabs)/chat/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useChat } from '../../../context/ChatProvider'; // Adjust path if needed

function NicknameSetup() {
  const { setNickname } = useChat();
  const [name, setName] = useState('');

  return (
    <View style={styles.setupContainer}>
      <Text style={styles.header}>Welcome to Mesh Chat</Text>
      <Text style={styles.sectionTitle}>Set your nickname to begin</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your nickname..."
        value={name}
        onChangeText={setName}
      />
      <Button 
        title="Start Chatting" 
        onPress={() => setNickname(name)} 
        disabled={!name.trim()}
      />
    </View>
  );
}

export default function ChatIndexScreen() {
  const router = useRouter();
  const { nickname, peers, joinChannel, restartServices, isConnecting } = useChat();
  const [channelName, setChannelName] = useState('');

  if (!nickname) {
    return <NicknameSetup />;
  }

  const handleJoinChannel = async (name: string) => {
    if (!name.trim()) return;
    const formattedChannel = name.startsWith('#') ? name : `#${name}`;
    await joinChannel(formattedChannel); 
    router.push(`/bchat/${encodeURIComponent(formattedChannel)}`);
  };

  const peerList = Object.entries(peers);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.nickname}>Hi, {nickname}</Text>
        <TouchableOpacity onPress={restartServices} style={styles.refreshButton} disabled={isConnecting}>
            {isConnecting ? <ActivityIndicator color="white" /> : <Text style={styles.refreshButtonText}>Refresh</Text>}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.generalChannelButton}
        onPress={() => handleJoinChannel('#general')}
      >
        <Text style={styles.generalChannelText}>Join #general (Public Chat)</Text>
      </TouchableOpacity>

      <View style={styles.joinSection}>
        <Text style={styles.sectionTitle}>Create a Private Channel</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter private channel name..."
          value={channelName}
          onChangeText={setChannelName}
          autoCapitalize="none"
        />
        <Button 
          title="Create & Join" 
          onPress={() => handleJoinChannel(channelName)} 
          disabled={!channelName.trim()}
        />
         <Text style={styles.infoText}>
            The channel name is the secret key.
         </Text>
      </View>

      <Text style={styles.subHeader}>Peers on the Network ({peerList.length}):</Text>
      <ScrollView style={styles.list}>
        {isConnecting ? <ActivityIndicator style={{marginTop: 20}}/> : peerList.length > 0 ? (
          peerList.map(([id, name]) => <Text key={id} style={styles.peerItem}>{`${name}`}</Text>)
        ) : (
          <Text style={styles.peerItem}>Scanning for nearby users...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
    setupContainer: { flex: 1, justifyContent: 'center', padding: 20, gap: 15 },
    header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
    nickname: { fontSize: 18, fontWeight: '600', color: '#333' },
    refreshButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    refreshButtonText: { color: 'white', fontWeight: 'bold'},
    generalChannelButton: { marginBottom: 20, paddingVertical: 15, backgroundColor: '#2E8B57', borderRadius: 8, alignItems: 'center' },
    generalChannelText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    joinSection: { marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', padding: 15, borderRadius: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, fontSize: 16 },
    subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    list: { flex: 1, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 5 },
    infoText: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 5 },
    peerItem: { paddingVertical: 4, fontSize: 14 },
});

