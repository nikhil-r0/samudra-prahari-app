// app/(tabs)/chat/[channel].tsx
import { BitchatMessage } from 'expo-bitchat';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useChat } from '../../../context/ChatProvider'; // Adjust path if needed

export default function ChannelScreen() {
  const navigation = useNavigation();
  const { channel: encodedChannel } = useLocalSearchParams<{ channel: string }>();
  const channel = decodeURIComponent(encodedChannel || '');
  const scrollViewRef = useRef<ScrollView>(null);

  const { messagesByChannel, sendMessage, nickname, isChannelEncrypted } = useChat();
  const [inputText, setInputText] = useState('');
  
  // Local state now holds all messages for this channel
  const [currentMessages, setCurrentMessages] = useState<BitchatMessage[]>([]);
  const isEncrypted = isChannelEncrypted(channel);

  // Effect to sync messages from context to local state
  useEffect(() => {
    setCurrentMessages(messagesByChannel[channel] || []);
  }, [messagesByChannel, channel]);
  
  // Automatically scroll down when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [currentMessages]);

  const participants = useMemo(() => {
    const senderSet = new Set<string>([nickname]); // Start with self
    currentMessages.forEach((msg) => {
      if (msg.sender) senderSet.add(msg.sender);
    });
    return Array.from(senderSet);
  }, [currentMessages, nickname]);

  useEffect(() => {
    const title = `${channel} ${isEncrypted ? '🔒' : ''}`;
    navigation.setOptions({ title });
  }, [channel, isEncrypted]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // 1. Call context function to send the message over BLE
      const optimisticMessage = sendMessage(inputText, channel);

      // 2. Immediately update local state for an instant UI update
      setCurrentMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
    >
        <View style={styles.headerContainer}>
            <Text style={styles.channelTitle}>{channel} {isEncrypted && '🔒'}</Text>
            <Text style={styles.participantList}>
                {participants.length} Participants: {participants.join(', ')}
            </Text>
        </View>

        <ScrollView 
            ref={scrollViewRef}
            style={styles.messageList}
            contentContainerStyle={{ paddingVertical: 10 }}
        >
            {currentMessages.map((msg: BitchatMessage, index: number) => {
                const isMyMessage = msg.sender === nickname;
                return (
                    <View 
                        key={msg.id || index} 
                        style={[
                            styles.messageBubble, 
                            isMyMessage ? styles.myMessage : styles.theirMessage
                        ]}
                    >
                        {!isMyMessage && <Text style={styles.senderText}>{msg.sender}</Text>}
                        <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>
                          {msg.content}
                        </Text>
                        {/* We now base the lock icon on our own state */}
                        {msg.isEncrypted && <Text style={[styles.lockIcon, isMyMessage && {color: '#e0e0e0'}]}>🔒</Text>}
                    </View>
                )
            })}
        </ScrollView>

        <View style={styles.inputContainer}>
            <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            />
            <Button title="Send" onPress={handleSendMessage} />
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    headerContainer: {
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    channelTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    participantList: {
        textAlign: 'center',
        color: '#666',
        marginTop: 4,
    },
    messageList: { flex: 1, paddingHorizontal: 10 },
    messageBubble: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginBottom: 10, maxWidth: '80%', flexDirection: 'row', alignItems: 'flex-end' },
    myMessage: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
    theirMessage: { backgroundColor: 'white', alignSelf: 'flex-start' },
    myMessageText: { color: 'white' },
    theirMessageText: { color: 'black' },
    senderText: { fontWeight: 'bold', marginBottom: 4, color: '#333', fontSize: 12, position: 'absolute', top: -16, left: 0},
    lockIcon: { fontSize: 12, marginLeft: 8, color: '#999' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', marginRight: 10, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25, backgroundColor: '#f9f9f9' },
});

