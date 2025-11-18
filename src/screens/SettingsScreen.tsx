import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {signOut, getCurrentUser} from '../services/authService';

const SettingsScreen = ({onLogout, onCreateRoom}: {onLogout: () => void; onCreateRoom: () => void}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    loadRoomCode();
  }, []);

  const loadRoomCode = async () => {
    try {
      const roomDataStr = await AsyncStorage.getItem('currentRoom');
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        setRoomCode(roomData.code);
      }
    } catch (error) {
      console.log('Error loading room code:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // await signOut(); // Temporalmente deshabilitado
              await AsyncStorage.setItem('isLoggedIn', 'false');
              onLogout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    onPress,
    showArrow = true,
    rightComponent,
  }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {rightComponent || (showArrow && <Text style={styles.arrow}>›</Text>)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ajustes</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <SettingItem
            icon="👤"
            title="Mi nombre"
            onPress={() => Alert.alert('Editar nombre')}
          />
          <SettingItem
            icon="🔑"
            title={roomCode ? `Sala: ${roomCode}` : 'Sin sala'}
            onPress={onCreateRoom}
          />
          <SettingItem
            icon="👥"
            title="Miembros de la sala"
            onPress={() => Alert.alert('Ver miembros')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación</Text>
          <SettingItem
            icon="🔔"
            title="Notificaciones"
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#CCC', true: '#FF4757'}}
              />
            }
          />
          <SettingItem
            icon="🌙"
            title="Modo oscuro"
            showArrow={false}
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{false: '#CCC', true: '#FF4757'}}
              />
            }
          />
          <SettingItem
            icon="📦"
            title="Instalar widget"
            onPress={() => Alert.alert('Widget', 'Funcionalidad de widget próximamente')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suscripción</Text>
          <SettingItem
            icon="💳"
            title="Administrar suscripción"
            onPress={() => Alert.alert('Suscripción', 'Panel de suscripción')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociales</Text>
          <SettingItem
            icon="🎵"
            title="TikTok"
            onPress={() => Alert.alert('TikTok', 'Vincular con TikTok')}
          />
          <SettingItem
            icon="💬"
            title="Discord"
            onPress={() => Alert.alert('Discord', 'Vincular con Discord')}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon="🔄"
            title="Reiniciar cuenta"
            onPress={() =>
              Alert.alert(
                'Reiniciar',
                '¿Seguro que quieres reiniciar tu cuenta?',
                [
                  {text: 'Cancelar', style: 'cancel'},
                  {text: 'Reiniciar', style: 'destructive'},
                ]
              )
            }
          />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.adContainer}>
          <Text style={styles.adText}>Anuncio (ej. Temu) iría aquí</Text>
          <TouchableOpacity style={styles.removeAdsButton}>
            <Text style={styles.removeAdsText}>✕ Quitar anuncios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 24,
    color: '#CCC',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4757',
    fontWeight: '600',
  },
  adContainer: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  adText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  removeAdsButton: {
    paddingVertical: 8,
  },
  removeAdsText: {
    fontSize: 14,
    color: '#FF4757',
    fontWeight: '600',
  },
});

export default SettingsScreen;

