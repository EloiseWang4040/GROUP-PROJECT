import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="camera" options={{ title: 'camera' }} />
            <Tabs.Screen name="memories" options={{ title: 'memories' }} />
            <Tabs.Screen name="setting" options={{ title: 'setting' }} />
            {/* 他にもタブがあればここに追加 */}
        </Tabs>
    );
}

