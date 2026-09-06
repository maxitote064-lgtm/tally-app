import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'Today' }} />
      <Tab.Screen name="Activity" component={ActivityScreen} options={{ title: 'Activity' }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Budget" component={BudgetScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
