import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../utils/firebaseUtils';

const COLORS = {
  bg: '#0b1118',
  surface: '#111b26',
  panel: '#172331',
  border: '#253447',
  amber: '#d9b04c',
  text: '#edf2f7',
  textMuted: '#8aa0b6',
  textDim: '#5d7288',
  red: '#ef6b6b',
};

export default function AuthScreen({ onAuthSuccess, onAuthChange }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Succès', 'Connexion réussie');
        onAuthSuccess?.(auth.currentUser);
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Succès', 'Compte créé avec succès');
        onAuthSuccess?.(auth.currentUser);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onAuthChange?.();
      Alert.alert('Succès', 'Déconnexion réussie');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textDim}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor={COLORS.textDim}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Se connecter' : 'Créer un compte'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.toggleText}>
            {isLogin
              ? "Pas encore inscrit ? Créer un compte"
              : 'Déjà inscrit ? Se connecter'}
          </Text>
        </TouchableOpacity>

        {auth.currentUser && (
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.amber,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    color: COLORS.text,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.amber,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.bg,
    fontWeight: '600',
    fontSize: 14,
  },
  toggleText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: COLORS.red,
    marginTop: 20,
  },
  logoutText: {
    color: COLORS.bg,
    fontWeight: '600',
    fontSize: 14,
  },
});
