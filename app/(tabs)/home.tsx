import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Text, Button, View, StyleSheet, ViewStyle, TextStyle, ImageStyle, TouchableOpacity, Image } from 'react-native';
import { useRouter} from 'expo-router';

export default function HomeScreen() {
    const { user, logout } = useFirebaseAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/'); // サインアウト後にログイン画面へ遷移
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleBar}>
                <Text style={styles.title}>WordScope</Text>
            </View>
            <View style={styles.mainScreen}>
                <Text style={styles.mainText}>You haven't yet taken a picture of the day.</Text>
            </View>
            {user ? (
                <>
                    <Text>{user.email}</Text>
                    <Button title="Sign Out" onPress={handleLogout} />
                </>
            ) : (
                <Text>Not logged in</Text>
            )}
            {/* ↓ メニューバー */}
            <View style={styles.menuBar}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push('/(tabs)/memories')}
                >
                    <Image source={require('../../assets/images/calendar.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push('/(tabs)/camera')}
                >
                    <Image source={require('../../assets/images/camera.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push('/(tabs)/game')}
                >
                    <Image source={require('../../assets/images/react-logo.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push('/(tabs)/setting')}
                >
                    <Image source={require('../../assets/images/settings.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create<{
    container: ViewStyle;
    titleBar: ViewStyle;
    title: TextStyle;
    mainScreen: ViewStyle;
    mainText: TextStyle;
    menuBar: ViewStyle;
    iconButton: ViewStyle;
    icon: ImageStyle;
}>({
    container: { flex: 1, justifyContent: 'space-between' },
    titleBar: { alignItems: 'center', padding: 30 },
    title: { fontSize: 32, fontWeight: 'bold' },
    mainScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainText: { fontSize: 18, textAlign: 'center' },
    menuBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#000',
    },
    iconButton: { padding: 10 },
    icon: { width: 30, height: 30 },
});
