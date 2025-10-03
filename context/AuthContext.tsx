// context/AuthContext.tsx
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  expoPushToken: string | null; // Add state for the token
  updateProfileWithNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  expoPushToken: null,
  updateProfileWithNotifications: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfileWithNotifications = async () => {
    if (!user) return;
    if (!Device.isDevice) {
        Alert.alert("Physical Device Required", "Push notifications only work on a physical device.");
        return;
    }

    // 1. Get Push Token
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Failed to get push token for push notification!');
        return;
    }

    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            throw new Error('Project ID not found in app.json/app.config.js');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        setExpoPushToken(token);
    } catch (e: any) {
        Alert.alert("Error getting push token", e.message);
        return;
    }


    // 2. Get Location
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    let last_known_location = null;
    if (locationStatus === 'granted') {
        const location = await Location.getLastKnownPositionAsync({});
        if (location) {
            last_known_location = `POINT(${location.coords.longitude} ${location.coords.latitude})`;
        }
    } else {
        console.warn('Location permission denied.');
    }

    // 3. Update Supabase Profile
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: token,
        last_known_location: last_known_location,
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error updating profile', error.message);
    } else {
      console.log('Profile updated with notification token and location.');
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, expoPushToken, updateProfileWithNotifications }}>
      {children}
    </AuthContext.Provider>
  );
};