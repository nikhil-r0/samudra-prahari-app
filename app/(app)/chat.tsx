import { FontAwesome5 } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useCallback, useEffect, useState } from 'react';
// Import the Keyboard module from react-native
import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, Send, User } from 'react-native-gifted-chat';

// --- Gemini API Configuration ---
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are the Samudra Prahari (Ocean Guardian) AI bot. Your primary role is to provide real-time, location-aware safety information and guidance for Marina Beach in Chennai, India.

Instructions:
1.  **Persona**: Be helpful, concise, and safety-focused. Use a slightly formal but reassuring tone.
2.  **Be Specific to Marina Beach**: Frame your answers in the context of Marina Beach. Mention local landmarks or conditions when relevant.`;

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
});

// --- User Definitions ---
const USER: User = {
  _id: 1,
  name: 'You',
};

const BOT: User = {
  _id: 2,
  name: 'Marina Beach Safety Bot',
  avatar: '🌊',
};


// --- Main Chat Screen Component ---
export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const headerHeight = useHeaderHeight();
  const keyboardVerticalOffset= Platform.OS === 'ios' ? headerHeight : headerHeight + (StatusBar?.currentHeight || 0);

  useEffect(() => {
    setMessages([
      {
        _id: Math.round(Math.random() * 1000000),
        text: 'Hello! I am the Marina Beach Safety Bot. How can I help you today? You can ask about tide times, wave conditions, or general safety.',
        createdAt: new Date(),
        user: BOT,
      },
    ]);
  }, []);

  const handleSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);

    try {
      const result = await model.generateContent(userMessage.text);
      const response = await result.response;
      const botResponse = response.text();

      const botMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: botResponse,
        createdAt: new Date(),
        user: BOT,
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));

    } catch (error) {
      console.error("Failed to get response from Gemini API:", error);
      const errorMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        createdAt: new Date(),
        user: BOT,
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [errorMessage]));
    } finally {
      setIsTyping(false);
    }
  }, []);

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <FontAwesome5 name="paper-plane" size={18} color="#0077be" />
      </View>
    </Send>
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: '#0077be' },
        left: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e0e0' },
      }}
      textStyle={{
        right: { color: '#ffffff' },
        left: { color: '#333333' },
      }}
    />
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={USER}
        isTyping={isTyping}
        renderSend={renderSend}
        renderBubble={renderBubble}
        placeholder="Ask about beach safety..."
        alwaysShowSend={true}
        renderAvatar={null}
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
        messagesContainerStyle={styles.messagesContainer}
        minInputToolbarHeight={48}
        isKeyboardInternallyHandled={false}
      />
      {/* Use our new, reliable custom spacer */}
      <KeyboardAvoidingView 
        behavior='padding'
        keyboardVerticalOffset={keyboardVerticalOffset - 20} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 6,
  },
  messagesContainer: {
    backgroundColor: '#f0f8ff',
  },
});