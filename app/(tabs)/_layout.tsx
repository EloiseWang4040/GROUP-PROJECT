import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen
  name="home"
  options={{
    title: 'Home',
    tabBarIcon: ({ focused, color, size }) => (
      <Image
        source={require('../../assets/images/home.png')} // homeアイコンがあれば
        style={{ width: size, height: size, tintColor: color }}
      />
    ),
  }}
/>
<Tabs.Screen
  name="memories"
  options={{
    title: 'memories',
    tabBarIcon: ({ focused, color, size }) => (
      <Image
        source={require('../../assets/images/calendar.png')}
        style={{ width: size, height: size, tintColor: color }}
      />
    ),
  }}
/>
<Tabs.Screen
  name="camera"
  options={{
    title: 'camera',
    tabBarIcon: ({ focused, color, size }) => (
      <Image
        source={require('../../assets/images/camera.png')}
        style={{ width: size, height: size, tintColor: color }}
      />
    ),
  }}
/>
<Tabs.Screen
  name="game"
  options={{
    title: 'game',
    tabBarIcon: ({ focused, color, size }) => (
      <Image
        source={require('../../assets/images/game.png')}
        style={{ width: size, height: size, tintColor: color }}
      />
    ),
  }}
/>
<Tabs.Screen
  name="setting"
  options={{
    title: 'setting',
    tabBarIcon: ({ focused, color, size }) => (
      <Image
        source={require('../../assets/images/settings.png')}
        style={{ width: size, height: size, tintColor: color }}
      />
    ),
  }}
/>
            {/* 他にもタブがあればここに追加 */}
        </Tabs>
    );
}

