import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function TabLayout() {
  return (
    <ThemeProvider>
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#ffd33d',
      headerStyle: {
        backgroundColor: '#25292e',
      },
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: {
      backgroundColor: '#25292e',
      },
    }}
  >

    <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <Ionicons name= {focused ? 'home-sharp': 'home-outline'} color={color} size={24} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="OtherDays" 
        options={{ 
          title: 'Other Days',
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color = {color} size= {24} />
          ) 
        }} 
      />

      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} color = {color} size= {24} />
          ) 
        }} 
      />

    </Tabs>
    <Tabs.Screen
      name="OtherDay"
      options={{ title: 'Other Day' }}
    />
    </ThemeProvider>
  );
}