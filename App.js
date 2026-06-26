import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/utils/firebaseUtils';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import AuthScreen from './src/screens/AuthScreen';
import { registerForPushNotificationsAsync, setupNotificationListeners } from './src/utils/notificationUtils';

const COLORS = {
  bg: '#0b1118',
  surface: '#111b26',
  panel: '#172331',
  border: '#253447',
  amber: '#d9b04c',
  text: '#edf2f7',
  textMuted: '#8aa0b6',
  red: '#ef6b6b',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // Setup Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Register for notifications
    registerForPushNotificationsAsync();

    // Setup notification listeners
    const unsubscribeNotifications = setupNotificationListeners((notification) => {
      console.log('Notification received:', notification);
    });

    return () => {
      unsubscribe();
      unsubscribeNotifications();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.amber, fontSize: 16 }}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'tools':
        return <ToolsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {renderScreen()}

      {/* Bottom Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: COLORS.surface, borderTopColor: COLORS.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.tabActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            📐 Calcul
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
            📋 Historique
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tools' && styles.tabActive]}
          onPress={() => setActiveTab('tools')}
        >
          <Text style={[styles.tabLabel, activeTab === 'tools' && styles.tabLabelActive]}>
            🛠️ Outils
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.amber,
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.amber,
  },
});
