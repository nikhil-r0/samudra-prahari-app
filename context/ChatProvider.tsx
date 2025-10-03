// context/ChatProvider.tsx
import BitchatAPI, { BitchatMessage, PeerInfo } from 'expo-bitchat';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

// Define the shape of our context state
interface ChatContextType {
  nickname: string;
  peers: PeerInfo;
  messagesByChannel: Record<string, BitchatMessage[]>;
  isChannelEncrypted: (channel: string) => boolean;
  sendMessage: (content: string, channel: string) => BitchatMessage;
  // UPDATE: joinChannel no longer takes a password
  joinChannel: (channel: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

const NICKNAME = `User-${Math.floor(Math.random() * 1000)}`;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [peers, setPeers] = useState<PeerInfo>({});
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, BitchatMessage[]>>({});
  const [channelPasswords, setChannelPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    // ... existing useEffect initialization logic ...
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
          setPeers((prev) => ({ ...prev, [peerID]: nickname }));
        })
      );
      subscriptions.push(
        BitchatAPI.addPeerDisconnectedListener(({ peerID }) => {
          setPeers((prev) => {
            const newPeers = { ...prev };
            delete newPeers[peerID];
            return newPeers;
          });
        })
      );
      subscriptions.push(
        BitchatAPI.addMessageListener((message) => {
          if(message.sender === NICKNAME) return;
          if (message.channel) {
            setMessagesByChannel((prev) => ({
              ...prev,
              [message.channel!]: [...(prev[message.channel!] || []), message],
            }));
          }
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

  const isChannelEncrypted = (channel: string): boolean => {
    if (channel === '#general') return false;
    return !!channelPasswords[channel];
  };

  const sendMessage = (content: string, channel: string): BitchatMessage => {
    BitchatAPI.sendMessage(content, [], channel);
    const optimisticMessage: BitchatMessage = {
      id: Math.random().toString(),
      sender: NICKNAME,
      content,
      channel,
      timestamp: Date.now(),
      isPrivate: false,
      isEncrypted: isChannelEncrypted(channel), 
    };
    return optimisticMessage;
  };
  
  // UPDATE: Simplified joinChannel logic
  const joinChannel = async (channel: string) => {
    // #general is always public, no password is set.
    if (channel === '#general') {
      console.log(`Joining public channel: ${channel}`);
      setChannelPasswords(prev => {
          const next = {...prev};
          delete next[channel];
          return next;
      });
      return;
    }

    // For any other channel, the name itself is the password.
    const password = channel; 
    try {
      await BitchatAPI.setChannelPassword(channel, password);
      setChannelPasswords(prev => ({...prev, [channel]: password}));
      console.log(`Encrypted channel "${channel}" joined. The name is the key.`);
    } catch (e) {
      console.error(`Failed to set password for ${channel}:`, e);
      Alert.alert("Error", "Could not set channel password.");
    }
  };

  return (
    <ChatContext.Provider value={{ nickname: NICKNAME, peers, messagesByChannel, isChannelEncrypted, sendMessage, joinChannel }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

const requestBlePermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const ANDROID_VERSION = Platform.Version as number;
    if (ANDROID_VERSION >= 31) {
        const res = await PermissionsAndroid.requestMultiple(['android.permission.BLUETOOTH_SCAN', 'android.permission.BLUETOOTH_CONNECT', 'android.permission.ACCESS_FINE_LOCATION']);
        const isGranted = res['android.permission.BLUETOOTH_SCAN'] === 'granted' && res['android.permission.BLUETOOTH_CONNECT'] === 'granted' && res['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
        if (!isGranted) Alert.alert('Permissions Required', 'Bluetooth and Location permissions are needed for chat on Android 12+.');
        return isGranted;
    } else {
        const res = await PermissionsAndroid.request('android.permission.ACCESS_FINE_LOCATION');
        const isGranted = res === 'granted';
        if (!isGranted) Alert.alert('Permission Required', 'Location permission is needed for Bluetooth scanning on older Android.');
        return isGranted;
    }
};

