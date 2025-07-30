import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2a2640',
          borderTopWidth: 0,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#ee880cff',
        tabBarInactiveTintColor: '#7b4604ff',

        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'home') iconName = 'home';
          if (route.name === 'profile') iconName = 'briefcase'; 
          if (route.name === 'all') iconName = 'compass';      
          if (route.name === 'favs') iconName = 'heart';        
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarLabel: 'Portfolio' }}
      />
      <Tabs.Screen
        name="favs"
        options={{ tabBarLabel: 'Watchlist' }}
      />
      <Tabs.Screen
        name="all"
        options={{ tabBarLabel: 'Explore' }}
      />
    </Tabs>
  );
}
