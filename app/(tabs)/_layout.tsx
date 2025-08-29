import { Tabs } from 'expo-router';
import { BarChart3, Receipt, Settings, UserPlus } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabLayout() {
   const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingTop: 0,
          paddingBottom: 0,
            height: 80 + (Platform.OS === "android" ? insets.bottom : 0), // dynamic bottom inset
        },
        tabBarIconStyle: {
          marginTop: 5,
          marginBottom: 0,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#6474ff',

        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 10,
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ size, color }) => (
            <Receipt size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="invite"
        options={{
          title: 'Invite',
          tabBarIcon: ({ size, color }) => (
            <UserPlus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
