// app/(tabs)/index.tsx
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, register, signIn } = useFirebaseAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace('/home');
        }
    }, [user]);

    return (
        <View style={styles.container}>
            <Text>Welcome!</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
            />
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
            />
            <Button title="Register" onPress={() => register(email, password)} />
            <Button title="Login" onPress={() => signIn(email, password)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        height: 40,
        margin: 8,
        borderWidth: 1,
        padding: 10,
    },
});
