import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SystemBars } from 'react-native-edge-to-edge';
import { initDatabase, getOnboardingComplete } from './src/database/database';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import WalletScreen from './src/screens/WalletScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { strings } from './src/theme/strings';

const TABS = [
  { key: 'home', label: strings.tabHome, icon: '🏠' },
  { key: 'tasks', label: strings.tabTasks, icon: '✅' },
  { key: 'wallet', label: strings.tabWallet, icon: '💰' },
  { key: 'dashboard', label: strings.tabDashboard, icon: '📊' },
  { key: 'settings', label: strings.settingsTitle, icon: '⚙️' },
];

function AppNavigator() {
  const { colors } = useTheme();
  const [dbReady, setDbReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    try {
      initDatabase();
      const onboardingDone = getOnboardingComplete();
      setShowOnboarding(!onboardingDone);
      setDbReady(true);
    } catch (e) {
      console.error('DB init error:', e);
    }
  }, []);

  const goToPage = (index) => {
    pagerRef.current?.setPage(index);
    setActivePage(index);
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  };

  const onPageSelected = (e) => {
    const index = e.nativeEvent.position;
    setActivePage(index);
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  };

  if (!dbReady) {
    return (
      <View style={{
        flex: 1, backgroundColor: colors.background,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textPrimary, marginTop: 12 }}>
          {strings.loading}
        </Text>
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SystemBars style="light" />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </GestureHandlerRootView>
    );
  }

  const TAB_WIDTH = 100 / TABS.length;
  const s = makeStyles(colors);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SystemBars style="light" />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={onPageSelected}
        overdrag
      >
        <View key="0" style={{ flex: 1 }}>
          <HomeScreen isFocused={activePage === 0} />
        </View>
        <View key="1" style={{ flex: 1 }}>
          <TasksScreen isFocused={activePage === 1} />
        </View>
        <View key="2" style={{ flex: 1 }}>
          <WalletScreen isFocused={activePage === 2} />
        </View>
        <View key="3" style={{ flex: 1 }}>
          <DashboardScreen isFocused={activePage === 3} />
        </View>
        <View key="4" style={{ flex: 1 }}>
          <SettingsScreen isFocused={activePage === 4} />
        </View>
      </PagerView>

      {/* Bottom Tab Bar */}
      <View style={s.tabBar}>
        <Animated.View
          style={[s.activeIndicator, {
            width: TAB_WIDTH + '%',
            left: indicatorAnim.interpolate({
              inputRange: [0, 1, 2, 3, 4],
              outputRange: ['0%', '20%', '40%', '60%', '80%'],
            }),
          }]}
        />
        {TABS.map((tab, index) => {
          const isActive = activePage === index;
          return (
            <TouchableOpacity
              key={tab.key}
              style={s.tabItem}
              onPress={() => goToPage(index)}
              activeOpacity={0.7}
            >
              <Text style={[s.tabIcon, { opacity: isActive ? 1 : 0.45 }]}>
                {tab.icon}
              </Text>
              <Text style={[s.tabLabel, { color: isActive ? colors.primary : colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 8,
    height: 70,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});