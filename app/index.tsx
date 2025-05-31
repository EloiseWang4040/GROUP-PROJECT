// app/index.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useRouter } from 'expo-router';
import { showAlert } from '@/utils/alert';
import { Button, TextInput } from 'react-native-paper';
import { Stack } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, register, signIn } = useFirebaseAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace('/camera');
        }
    }, [user]);

    return (
        <>
            <Stack.Screen options={{ title: 'login' }} />
            <View style={styles.container}>
                <Text style={styles.title}>Welcome!</Text>
                <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    label="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    mode="outlined"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    label="Password"
                    secureTextEntry
                />
                <Button 
                    mode="contained" 
                    style={styles.button} 
                    contentStyle={styles.buttonContent}
                    onPress={async () => {
                        const result = await register(email, password);
                        if (!result.success) {
                            showAlert('Register エラー', result.message);
                        }
                    }}
                >
                    Register
                </Button>
                <Button 
                    mode="contained" 
                    style={styles.button} 
                    contentStyle={styles.buttonContent}
                    onPress={async () => {
                        const result = await signIn(email, password);
                        if (!result.success) {
                            showAlert('Sign in エラー', result.message);
                        }
                    }}
                >
                    Sign In
                </Button>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    input: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: 'white',
    },
    button: {
        width: '100%',
        marginBottom: 15,
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 10,
    },
});
