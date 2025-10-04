// context/ChatProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import BitchatAPI, { BitchatMessage, PeerInfo } from 'expo-bitchat';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

const NICKNAME_STORAGE_KEY = '@Bitchat:nickname';

interface ChatContextType {
  nickname: string | null;
  setNickname: (name: string) => Promise<void>;
  isConnecting: boolean;
  peers: PeerInfo;
  messagesByChannel: Record<string, BitchatMessage[]>;
  isChannelEncrypted: (channel: string) => boolean;
  sendMessage: (content: string, channel: string) => BitchatMessage;
  joinChannel: (channel: string) => Promise<void>;
  restartServices: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [nickname, setNicknameState] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peers, setPeers] = useState<PeerInfo>({});
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, BitchatMessage[]>>({});
  const [channelPasswords, setChannelPasswords] = useState<Record<string, string>>({});

  // NEW: Load nickname from storage on app start
  useEffect(() => {
    const loadNickname = async () => {
      const storedNickname = await AsyncStorage.getItem(NICKNAME_STORAGE_KEY);
      if (storedNickname) {
        setNicknameState(storedNickname);
      }
    };
    loadNickname();
  }, []);

  // MODIFIED: This effect now depends on the nickname to start/stop the service
  useEffect(() => {
    const subscriptions: { remove: () => void }[] = [];
    let isMounted = true;

    const initializeBitchat = async (name: string) => {
      if (!isMounted) return;
      setIsConnecting(true);
      setPeers({}); // Clear old peers on restart

      const permissionsGranted = await requestBlePermissions();
      if (!permissionsGranted) {
        setIsConnecting(false);
        return;
      }
      
      await BitchatAPI.startServices(name);
      console.log('Bitchat service started with nickname:', name);

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
          if (message.sender === name) return;
          if (message.channel) {
            setMessagesByChannel((prev) => ({
              ...prev,
              [message.channel!]: [...(prev[message.channel!] || []), message],
            }));
          }
        })
      );
      setIsConnecting(false);
    };

    if (nickname) {
      initializeBitchat(nickname);
    }

    return () => {
      isMounted = false;
      subscriptions.forEach((sub) => sub.remove());
      if (nickname) {
        BitchatAPI.stopServices();
        console.log('Bitchat services stopped.');
      }
    };
  }, [nickname]);

  const setNickname = async (name: string) => {
    await AsyncStorage.setItem(NICKNAME_STORAGE_KEY, name);
    setNicknameState(name);
  };
  
  const restartServices = useCallback(async () => {
    if (nickname) {
        console.log("Restarting services...");
        await BitchatAPI.stopServices();
        // Trigger the useEffect to re-initialize by temporarily clearing the nickname
        const currentName = nickname;
        setNicknameState(null);
        setTimeout(() => setNicknameState(currentName), 100);
    }
  }, [nickname]);

  const isChannelEncrypted = (channel: string): boolean => {
    if (channel === '#general') return false;
    return !!channelPasswords[channel];
  };

  const sendMessage = (content: string, channel: string): BitchatMessage => {
    BitchatAPI.sendMessage(content, [], channel);
    const optimisticMessage: BitchatMessage = {
      id: Math.random().toString(), sender: nickname!, content, channel,
      timestamp: Date.now(), isPrivate: false, isEncrypted: isChannelEncrypted(channel),
    };
    return optimisticMessage;
  };

  const joinChannel = async (channel: string) => {
    if (channel === '#general') {
      return;
    }
    const password = channel;
    try {
      await BitchatAPI.setChannelPassword(channel, password);
      setChannelPasswords(prev => ({ ...prev, [channel]: password }));
    } catch (e) {
      Alert.alert("Error", "Could not set channel password.");
    }
  };

  return (
    <ChatContext.Provider value={{ nickname, setNickname, isConnecting, peers, messagesByChannel, isChannelEncrypted, sendMessage, joinChannel, restartServices }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}

const requestBlePermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const ANDROID_VERSION = Platform.Version as number;
    let permissions = ['android.permission.ACCESS_FINE_LOCATION'];
    if (ANDROID_VERSION >= 31) { // Android 12+
        permissions.push('android.permission.BLUETOOTH_SCAN', 'android.permission.BLUETOOTH_CONNECT');
    } else { // Older Android
        permissions.push('android.permission.ACCESS_COARSE_LOCATION');
    }
    const res = await PermissionsAndroid.requestMultiple(permissions as any);
    const isGranted = Object.values(res).every(status => status === 'granted');
    if (!isGranted) Alert.alert('Permissions Required', 'All Bluetooth and Location permissions are required for chat.');
    return isGranted;
};

