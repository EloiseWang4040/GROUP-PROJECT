import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import type { CameraRatio } from 'expo-camera';
import { useRouter } from 'expo-router';
import { uploadImage } from '../lib/uploadImage';

export default function CameraScreen() {
    const cameraRef = useRef<any>(null);
    const [hasPermission, requestPermission] = useCameraPermissions();
    const [ratio, setRatio] = useState<CameraRatio>('4:3');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission]);

    useEffect(() => {
        (async () => {
            if (cameraRef.current) {
                const supportedRatios = await cameraRef.current.getSupportedRatiosAsync?.();
                if (supportedRatios?.includes('3:4')) {
                    setRatio('4:3');
                } else if (supportedRatios && supportedRatios.length > 0) {
                    setRatio(supportedRatios[0]);
                }
            }
        })();
    }, [cameraRef]);

    const handleUpload = async () => {
        if (photoUri) {
            const result = await uploadImage(photoUri);
            console.log('アップロードURL:', result.imageUrl);
        } else {
            console.warn('先に写真を撮影してください');
        }
    };

    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                ratio={ratio}
            >
                <View style={styles.cameraButtonContainer}>
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={async () => {
                            if (cameraRef.current) {
                                const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync();
                                setPhotoUri(photo.uri);
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Capture</Text>
                    </TouchableOpacity>
                    {photoUri && (
                        <TouchableOpacity
                            style={[styles.cameraButton, { marginTop: 10, backgroundColor: '#4caf50' }]}
                            onPress={handleUpload}
                        >
                            <Text style={styles.buttonText}>Upload</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create<{
    screen: ViewStyle;
    camera: ViewStyle;
    cameraButtonContainer: ViewStyle;
    cameraButton: ViewStyle;
    buttonText: TextStyle;
    permissionContainer: ViewStyle;
}>({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cameraButtonContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
    },
    cameraButton: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
