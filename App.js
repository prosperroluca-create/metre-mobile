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
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';

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

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      
      {activeTab === 'home' && <HomeScreen />}
      {activeTab === 'history' && <HistoryScreen />}

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
