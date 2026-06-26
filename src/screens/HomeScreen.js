import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MetaFields from '../components/MetaFields';
import ZoneBlock from '../components/ZoneBlock';
import TotalPanel from '../components/TotalPanel';

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

const STORAGE_KEY = 'releve_surfaces_blocs_v4';

export default function HomeScreen() {
  const [meta, setMeta] = useState({ projet: '', ref: '', redacteur: '' });
  const [zones, setZones] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setMeta(parsed.meta || {});
        setZones(parsed.zones || []);
        calculateTotal(parsed.zones || []);
      } else {
        initializeDefault();
      }
    } catch (e) {
      console.error('Error loading state:', e);
      initializeDefault();
    }
  };

  const initializeDefault = () => {
    const defaultZones = [
      { id: 1, title: 'RDC', rows: [] },
      { id: 2, title: 'Étage', rows: [] },
      { id: 3, title: 'Terrasse', rows: [] },
    ];
    setZones(defaultZones);
    saveState(defaultZones, meta);
  };

  const saveState = async (zonesData, metaData) => {
    try {
      const state = { meta: metaData, zones: zonesData };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  };

  const calculateTotal = (zonesData) => {
    let totalVal = 0;
    let countVal = 0;

    zonesData.forEach(zone => {
      zone.rows?.forEach(row => {
        const val = parseFloat(row.largeur || 0) * parseFloat(row.longueur || 0) * (parseFloat(row.quantite || 1));
        if (!isNaN(val) && val > 0) {
          totalVal += val;
          countVal++;
        }
      });
    });

    setTotal(totalVal);
    setCount(countVal);
  };

  const addZone = () => {
    const newZone = {
      id: Math.max(...zones.map(z => z.id), 0) + 1,
      title: `Zone ${zones.length + 1}`,
      rows: [],
    };
    const newZones = [...zones, newZone];
    setZones(newZones);
    saveState(newZones, meta);
  };

  const updateZone = (zoneId, updatedZone) => {
    const newZones = zones.map(z => (z.id === zoneId ? updatedZone : z));
    setZones(newZones);
    calculateTotal(newZones);
    saveState(newZones, meta);
  };

  const deleteZone = (zoneId) => {
    Alert.alert('Supprimer la zone ?', 'Cette action est irréversible.', [
      { text: 'Annuler', onPress: () => {} },
      {
        text: 'Supprimer',
        onPress: () => {
          const newZones = zones.filter(z => z.id !== zoneId);
          setZones(newZones);
          calculateTotal(newZones);
          saveState(newZones, meta);
        },
      },
    ]);
  };

  const resetAll = () => {
    Alert.alert('Réinitialiser ?', 'Effacer toutes les zones et lignes ?', [
      { text: 'Annuler', onPress: () => {} },
      {
        text: 'Réinitialiser',
        onPress: () => {
          initializeDefault();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Relevé des surfaces</Text>
          <Text style={styles.title}>
            Métré <Text style={{ color: COLORS.amber }}>·</Text> Calcul
          </Text>
        </View>
      </View>

      <MetaFields meta={meta} setMeta={setMeta} onMetaChange={(newMeta) => {
        setMeta(newMeta);
        saveState(zones, newMeta);
      }} />

      <View style={styles.zonesContainer}>
        {zones.map(zone => (
          <ZoneBlock
            key={zone.id}
            zone={zone}
            onUpdate={(updated) => updateZone(zone.id, updated)}
            onDelete={() => deleteZone(zone.id)}
            onRecalculate={(updated) => {
              updateZone(zone.id, updated);
              calculateTotal([...zones.map(z => z.id === zone.id ? updated : z)]);
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.btnAdd} onPress={addZone}>
        <Text style={styles.btnAddText}>+ Ajouter un bloc</Text>
      </TouchableOpacity>

      <TotalPanel total={total} count={count} />

      <TouchableOpacity style={styles.btnReset} onPress={resetAll}>
        <Text style={styles.btnResetText}>Réinitialiser</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    color: COLORS.amber,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  zonesContainer: {
    marginBottom: 16,
  },
  btnAdd: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  btnAddText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  btnReset: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnResetText: {
    color: COLORS.red,
    fontWeight: '600',
    fontSize: 12,
  },
});
