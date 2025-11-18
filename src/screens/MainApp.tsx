import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import BoardScreen from './BoardScreen';
import SettingsScreen from './SettingsScreen';
import CreateRoomScreen from './CreateRoomScreen';
import {configureGoogleSignIn} from '../services/authService';

type Tab = 'board' | 'settings' | 'createRoom';

const MainApp = ({onLogout}: {onLogout: () => void}) => {
  const [activeTab, setActiveTab] = useState<Tab>('board');

  // Configurar Google Sign-In al montar el componente
  useEffect(() => {
    // configureGoogleSignIn(); // Temporalmente deshabilitado
  }, []);

  const handleRoomCreated = (roomCode: string) => {
    setActiveTab('board');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'board' && <BoardScreen />}
        {activeTab === 'settings' && <SettingsScreen onLogout={onLogout} onCreateRoom={() => setActiveTab('createRoom')} />}
        {activeTab === 'createRoom' && <CreateRoomScreen onRoomCreated={handleRoomCreated} onBack={() => setActiveTab('settings')} />}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'board' && styles.activeTab]}
          onPress={() => setActiveTab('board')}>
          <Text style={[styles.tabText, activeTab === 'board' && styles.activeTabText]}>
             Pizarra
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
             Ajustes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#FF6B9D',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
});

export default MainApp;
