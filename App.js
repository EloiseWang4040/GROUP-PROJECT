import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';

const Stack = createStackNavigator();

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.titleBar}>
                <Text style={styles.title}>WordScope</Text>
            </View>
            <View style={styles.mainScreen}>
                <Text style={styles.mainText}>You haven't yet taken a picture of the day.</Text>
            </View>
            <View style={styles.menuBar}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Memories')}>
                    <Image source={require('./assets/calendar.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Camera')}>
                    <Image source={require('./assets/camera.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
                    <Image source={require('./assets/settings.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CameraScreen = ({ navigation }) => {
    const [cameraRef, setCameraRef] = useState(null);
    const [hasPermission, requestPermission] = useCameraPermissions();
    const [ratio, setRatio] = useState('3:4'); // 3:4 のアスペクト比を設定

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    useEffect(() => {
        if (cameraRef) {
            (async () => {
                const supportedRatios = await cameraRef.getSupportedRatiosAsync();
                console.log('Available Ratios:', supportedRatios);
                if (supportedRatios.includes('3:4')) {
                    setRatio('3:4'); // 3:4 がサポートされていれば設定
                } else {
                    setRatio(supportedRatios[0]); // 最初のサポートされている比率を設定
                }
            })();
        }
    }, [cameraRef]);

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
                ref={(ref) => setCameraRef(ref)}
                ratio={ratio} // アスペクト比を設定
            >
                <View style={styles.cameraButtonContainer}>
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={async () => {
                            if (cameraRef) {
                                const photo = await cameraRef.takePictureAsync();
                                console.log(photo.uri); // 撮影した写真のURIを表示
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Capture</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

const MemoriesScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.screenText}>Memories Screen</Text>
    </View>
);

const SettingsScreen = () => (
    <View style={styles.screen}>
        <Text style={styles.screenText}>Settings Screen</Text>
    </View>
);

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Memories" component={MemoriesScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Camera" component={CameraScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    titleBar: {
        alignItems: 'center',
        padding: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
    },
    mainScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainText: {
        fontSize: 18,
        textAlign: 'center',
    },
    menuBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#000',
    },
    iconButton: {
        padding: 10,
    },
    icon: {
        width: 30,
        height: 30,
    },
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenText: {
        fontSize: 24,
        fontWeight: 'bold',
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
    photoPreview: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});