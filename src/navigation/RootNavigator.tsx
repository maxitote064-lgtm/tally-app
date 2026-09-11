import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { InstitutionsScreen } from '../screens/InstitutionsScreen';
import { ConsentScreen } from '../screens/ConsentScreen';
import { AuthorizationScreen } from '../screens/AuthorizationScreen';
import { ConnectionsScreen } from '../screens/ConnectionsScreen';
import { EditFieldsScreen } from '../screens/EditFieldsScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { useT } from '../store/useStore';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const t = useT();
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
      detachInactiveScreens
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: t('tabToday') }} />
      <Tab.Screen name="Accounts" component={AccountsScreen} options={{ title: t('tabAccounts') }} />
      <Tab.Screen name="Activity" component={ActivityScreen} options={{ title: t('tabActivity') }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: t('tabInsights') }} />
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
      <Stack.Screen name="Institutions" component={InstitutionsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Consent" component={ConsentScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Authorization" component={AuthorizationScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Connections" component={ConnectionsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="EditFields" component={EditFieldsScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
