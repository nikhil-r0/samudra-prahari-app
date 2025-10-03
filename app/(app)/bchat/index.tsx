// app/(tabs)/chat/index.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useChat } from '../../../context/ChatProvider'; // Adjust path if needed

export default function ChatIndexScreen() {
  const router = useRouter();
  const { nickname, peers, joinChannel } = useChat();
  const [channelName, setChannelName] = useState('');

  const handleJoinChannel = async (name: string) => {
    if (!name.trim()) return;
    // Ensure channel name starts with '#'
    const formattedChannel = name.startsWith('#') ? name : `#${name}`;
    
    // The password is now handled internally by the context provider
    await joinChannel(formattedChannel); 
    router.push(`/bchat/${encodeURIComponent(formattedChannel)}`);
  };

  const peerList = Object.entries(peers);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mesh Chat</Text>
      <Text style={styles.nickname}>Your nickname: {nickname}</Text>
      
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
            The channel name is the secret key. Only users with the exact name can read messages.
         </Text>
      </View>

      <Text style={styles.subHeader}>Peers on the Network ({peerList.length}):</Text>
      <ScrollView style={styles.list}>
        {peerList.length > 0 ? (
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
    header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    nickname: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    generalChannelButton: {
        marginBottom: 20,
        paddingVertical: 15,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignItems: 'center',
    },
    generalChannelText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    joinSection: { marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', padding: 15, borderRadius: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, fontSize: 16 },
    subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
    list: { flex: 1, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 5 },
    infoText: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 5 },
    peerItem: { paddingVertical: 4, fontSize: 14 },
});
