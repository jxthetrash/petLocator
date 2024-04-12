import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import CurrentPin from './CurrentPin';
import History from './History';
import { Ionicons } from '@expo/vector-icons'; // Make sure to import Ionicons

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CurrentPinStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CurrentPin" component={CurrentPin} />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="History" component={History} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Current Location') {
          iconName = focused ? 'navigate-circle' : 'navigate-circle-outline';
        } else if (route.name === 'History Map') {
          iconName = focused ? 'time' : 'time-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      "tabBarActiveTintColor": "orange",
      "tabBarInactiveTintColor": "gray",
      "tabBarStyle": [
        {
          "display": "flex"
        },
        null
      ]
    })}
  >
    <Tab.Screen name="Current Location" component={CurrentPinStack} />
    <Tab.Screen name="History Map" component={HistoryStack} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
