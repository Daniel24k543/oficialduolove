import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BoardScreen from '../screens/BoardScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4757',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Board"
        component={BoardScreen}
        options={{
          tabBarLabel: 'Pizarra',
          tabBarIcon: ({color, size}) => <TabIcon icon="🎨" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({color, size}) => <TabIcon icon="⚙️" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const TabIcon = ({icon, color}: {icon: string; color: string}) => {
  return null; // Se renderizará como emoji en React Native
};

export default MainTabNavigator;
