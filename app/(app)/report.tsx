import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base64-arraybuffer';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// IMPORTANT: Replace YOUR_COMPUTER_IP with your actual local IP address.
const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'https://your-backend-api.com';
const SUPABASE_BUCKET = 'reports'; 

export default function ReportScreen() {
    const { session, user } = useAuth();
    
    const [hazardType, setHazardType] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState('');
    const [loading, setLoading] = useState(false);

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();

    const cameraRef = useRef<CameraView>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [isRecording, setIsRecording] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [captureMode, setCaptureMode] = useState<'picture' | 'video'>('picture');

    const player = useVideoPlayer(null, (player) => {
        player.loop = true;
    });

   useEffect(() => {
    const loadVideo = async () => {
        if (videoUri) {
            await player.replaceAsync({ uri: videoUri });
            player.play();
        } else {
            player.pause();
            await player.replaceAsync(null);
        }
    };

    loadVideo();

    return () => {
        player.pause();
        player.replaceAsync(null); 
    };
}, [videoUri]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Permission to access location was denied');
                return;
            }
            let locationResult = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: locationResult.coords.latitude,
                longitude: locationResult.coords.longitude,
            });
        })();
    }, []);

    if (!cameraPermission || !micPermission) {
        return (
            <View style={styles.permissionContainer}>
                <ActivityIndicator size="large" />
                <Text>Checking permissions...</Text>
            </View>
        );
    }

    if (!cameraPermission.granted || !micPermission.granted) {
        const handleRequestPermissions = () => {
            requestCameraPermission();
            requestMicPermission();
        };

        return (
            <View style={styles.permissionContainer}>
                <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 20 }}>
                    We need camera and microphone permissions to document hazards.
                </Text>
                <TouchableOpacity style={styles.submitButton} onPress={handleRequestPermissions}>
                    <Text style={styles.submitButtonText}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const openCamera = (mode: 'picture' | 'video') => {
        setCaptureMode(mode);
        setIsCameraVisible(true);
    };

    const takePicture = async () => {
        if (!cameraRef.current) return;
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo?.uri || null);
        setIsCameraVisible(false);
    };

    const recordVideo = () => {
        if (!cameraRef.current) return;
        if (isRecording) {
            cameraRef.current.stopRecording();
        } else {
            setIsRecording(true);
            cameraRef.current.recordAsync()
                .then((video) => {
                    setVideoUri(video?.uri||null);
                })
                .catch(console.error)
                .finally(() => {
                    setIsRecording(false);
                    setIsCameraVisible(false);
                });
        }
    };

    const uploadMediaToSupabase = async (uri: string, isVideo: boolean = false): Promise<string | null> => {
        if (!user) return null;

        try {
            // UPDATED: Create a user-specific file path as per the new RLS policies.
            // This organizes uploads into folders based on the user's ID.
            const fileExt = isVideo ? 'mp4' : 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const base64 = await readAsStringAsync(uri, {
                encoding: 'base64',
            });
            
            const { error: uploadError } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .upload(filePath, decode(base64), {
                    contentType: isVideo ? 'video/mp4' : 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                console.error("Supabase Upload Error:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from(SUPABASE_BUCKET)
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!session || !user) {
            Alert.alert('Authentication Error', 'Please sign in to submit a report.');
            return;
        }

        if (!hazardType || !description || !location) {
            Alert.alert('Missing Information', 'Please fill all fields and ensure location is enabled.');
            return;
        }

        setLoading(true);

        try {
            let mediaUrl: string | null = null;

            if (photoUri) {
                mediaUrl = await uploadMediaToSupabase(photoUri, false);
            } else if (videoUri) {
                mediaUrl = await uploadMediaToSupabase(videoUri, true);
            }

            const reportPayload = {
                hazard_type: hazardType,
                description: description,
                latitude: location.latitude,
                longitude: location.longitude,
                media_url: mediaUrl,
            };

            const response = await fetch(`${BACKEND_API_URL}/api/reports/citizen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(reportPayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            Alert.alert(
                'Report Submitted Successfully', 
                'Your hazard report has been submitted and will be reviewed by our team.',
                [{ text: 'OK' }]
            );
            
            setHazardType('');
            setDescription('');
            setPhotoUri(null);
            setVideoUri(null);
            
        } catch (error: any) {
            console.error('Error submitting report:', error);
            
            try {
                const localReport = {
                    id: `report_${Date.now()}`,
                    hazard_type: hazardType,
                    description,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    photo_uri: photoUri || undefined,
                    video_uri: videoUri || undefined,
                    status: 'queued_for_upload'
                };

                const existingReports = await AsyncStorage.getItem('queued_reports');
                const reports = existingReports ? JSON.parse(existingReports) : [];
                reports.push(localReport);
                await AsyncStorage.setItem('queued_reports', JSON.stringify(reports));
                
                Alert.alert(
                    'Report Saved Locally', 
                    'Unable to submit report online. Your report has been saved locally and will be submitted when connection is restored.',
                    [{ text: 'OK' }]
                );
            } catch (localError) {
                Alert.alert(
                    'Submission Failed', 
                    'Unable to submit report. Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const renderMediaButtons = () => (
        <View>
            <Text style={styles.label}>Add Media (Optional)</Text>
            {photoUri ? (
                <View style={styles.mediaPreview}>
                    <Image source={{ uri: photoUri }} style={styles.previewImage} contentFit="cover" />
                    <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.retakeButton}>
                        <Text style={styles.retakeButtonText}>Remove Photo</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity onPress={() => openCamera('picture')} style={styles.mediaButton}>
                    <FontAwesome5 name="camera" size={20} color="#0077be" />
                    <Text style={styles.mediaButtonText}>Take Photo</Text>
                </TouchableOpacity>
            )}

            {videoUri ? (
                <View style={styles.mediaPreview}>
                    <VideoView
                        player={player}
                        style={styles.previewImage}
                        nativeControls={true}
                        contentFit="cover"
                    />
                    <TouchableOpacity onPress={() => setVideoUri(null)} style={styles.retakeButton}>
                        <Text style={styles.retakeButtonText}>Remove Video</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity onPress={() => openCamera('video')} style={styles.mediaButton}>
                    <FontAwesome5 name="video" size={20} color="#0077be" />
                    <Text style={styles.mediaButtonText}>Record Video</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (isCameraVisible) {
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFill}
                    ref={cameraRef}
                    facing={facing}
                    mode={captureMode}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setIsCameraVisible(false)}>
                    <FontAwesome6 name="xmark" size={32} color="white" />
                </TouchableOpacity>
                <View style={styles.cameraControls}>
                    <Pressable onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}>
                        <FontAwesome5 name="sync-alt" size={28} color="white" />
                    </Pressable>
                    <Pressable onPress={captureMode === 'picture' ? takePicture : recordVideo}>
                        <View style={isRecording ? styles.recordButtonActive : styles.shutterButton}>
                            {isRecording && <View style={styles.recordSquare} />}
                        </View>
                    </Pressable>
                    <View style={{ width: 28 }} />
                </View>
            </View>
        );
    }
    
    return (
        <KeyboardAvoidingView
              style={styles.keyboardAvoidingContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Report a New Hazard</Text>
            <Text style={styles.label}>Type of Hazard</Text>
            <TextInput style={styles.input} placeholder="e.g., Oil Spill, Plastic Debris" value={hazardType} onChangeText={setHazardType} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.multilineInput]} placeholder="Provide details..." value={description} onChangeText={setDescription} multiline />
            <Text style={styles.label}>Location</Text>
            {location ? (
                <Text style={styles.locationText}>Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}</Text>
            ) : (
                <Text style={styles.errorText}>{locationError || 'Fetching location...'}</Text>
            )}
            {renderMediaButtons()}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Report</Text>}
            </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: '#f0f8ff',
    },
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f0f8ff',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f8ff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#005a9c',
        marginBottom: 25,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: '#005a9c',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 50,
        backgroundColor: 'white',
        borderColor: '#b0c4de',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    locationText: {
        fontSize: 16,
        padding: 15,
        backgroundColor: '#e6f2ff',
        borderRadius: 8,
        color: '#005a9c',
        marginBottom: 20,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#d9534f',
        textAlign: 'center',
        marginBottom: 20,
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderColor: '#b0c4de',
        borderWidth: 1,
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    mediaButtonText: {
        color: '#0077be',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: '#0077be',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
    },
    shutterButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: 'gray',
    },
    recordButtonActive: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#d9534f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordSquare: {
        width: 30,
        height: 30,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    mediaPreview: {
        alignItems: 'center',
        marginBottom: 20,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    retakeButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    retakeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

