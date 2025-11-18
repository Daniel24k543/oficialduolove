import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import auth from '@react-native-firebase/auth';
import {firebaseService} from '../services/firebaseService';
import {Camera, CameraType} from 'react-native-camera-kit';

interface CreateRoomScreenProps {
  onRoomCreated: (roomCode: string) => void;
  onBack: () => void;
}

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({
  onRoomCreated,
  onBack,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);

  // Obtener o crear ID de usuario
  useEffect(() => {
    const initUserId = async () => {
      let uid = auth().currentUser?.uid;
      if (!uid) {
        // Si no hay usuario autenticado, usar anónimo
        const result = await auth().signInAnonymously();
        uid = result.user.uid;
      }
      setUserId(uid);
    };
    initUserId();
  }, []);

  // Generar código único de 6 caracteres
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la sala');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'Inicializando usuario...');
      return;
    }

    setLoading(true);
    try {
      // Generar código único
      const roomCode = generateRoomCode();

      // Crear sala en Firebase
      await firebaseService.createRoom(roomCode, roomName, userId);

      // También guardar localmente para compatibilidad
      const roomData = {
        code: roomCode,
        name: roomName,
        createdAt: new Date().toISOString(),
        members: 1,
      };
      await AsyncStorage.setItem('currentRoom', JSON.stringify(roomData));

      // Mostrar QR code
      setCreatedRoomCode(roomCode);
    } catch (error) {
      console.error('Error creando sala:', error);
      Alert.alert('Error', 'No se pudo crear la sala');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Ingresa el código de la sala');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'Inicializando usuario...');
      return;
    }

    const code = joinCode.toUpperCase().trim();

    if (code.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Verificar si la sala existe en Firebase
      const exists = await firebaseService.roomExists(code);
      
      if (!exists) {
        Alert.alert('Error', 'Código inválido. La sala no existe.');
        setLoading(false);
        return;
      }

      // Unirse a la sala en Firebase
      await firebaseService.joinRoom(code, userId);

      // Guardar localmente
      const roomData = {
        code: code,
        name: 'Sala compartida',
        createdAt: new Date().toISOString(),
        members: 2,
      };
      await AsyncStorage.setItem('currentRoom', JSON.stringify(roomData));

      Alert.alert(
        '¡Conectado! 💕',
        'Te uniste a la sala exitosamente',
        [
          {
            text: 'OK',
            onPress: () => onRoomCreated(code),
          },
        ],
      );
    } catch (error) {
      console.error('Error uniéndose a sala:', error);
      Alert.alert('Error', 'No se pudo unir a la sala');
    } finally {
      setLoading(false);
    }
  };

  // Manejar código escaneado
  const handleQRScanned = async (event: any) => {
    const scannedCode = event.nativeEvent.codeStringValue;
    if (scannedCode && scannedCode.length === 6) {
      setShowScanner(false);
      setJoinCode(scannedCode);
      // Auto-unirse después de escanear
      setTimeout(() => {
        handleJoinRoom();
      }, 500);
    }
  };

  // Modal para mostrar QR creado
  if (createdRoomCode) {
    return (
      <View style={styles.container}>
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>¡Sala Creada! 🎉</Text>
          <Text style={styles.qrSubtitle}>Escanea este código QR con tu pareja</Text>
          
          <View style={styles.qrBox}>
            <QRCode value={createdRoomCode} size={250} />
          </View>
          
          <Text style={styles.qrCode}>{createdRoomCode}</Text>
          <Text style={styles.qrHint}>O comparte este código manualmente</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setCreatedRoomCode(null);
              onRoomCreated(createdRoomCode);
            }}>
            <Text style={styles.buttonText}>✓ Continuar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏠 Sala de Pareja</Text>
        <Text style={styles.subtitle}>
          Crea o únete a una sala para conectar con tu pareja
        </Text>
      </View>

      {/* Toggle entre Crear y Unirse */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'create' && styles.toggleActive]}
          onPress={() => setMode('create')}>
          <Text
            style={[
              styles.toggleText,
              mode === 'create' && styles.toggleTextActive,
            ]}>
            Crear Sala
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, mode === 'join' && styles.toggleActive]}
          onPress={() => setMode('join')}>
          <Text
            style={[
              styles.toggleText,
              mode === 'join' && styles.toggleTextActive,
            ]}>
            Unirse a Sala
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulario Crear Sala */}
      {mode === 'create' && (
        <View style={styles.formContainer}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.formTitle}>Crear Nueva Sala</Text>
          <Text style={styles.formSubtitle}>
            Crea un espacio para compartir con tu pareja
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de la sala (ej: Amor Eterno)"
            placeholderTextColor="#999"
            value={roomName}
            onChangeText={setRoomName}
            editable={!loading}
            maxLength={30}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateRoom}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>✨ Crear Sala</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Al crear la sala recibirás un código único de 6 caracteres
            </Text>
            <Text style={styles.infoText}>
              📤 Compártelo con tu pareja para que se una
            </Text>
          </View>
        </View>
      )}

      {/* Formulario Unirse a Sala */}
      {mode === 'join' && (
        <View style={styles.formContainer}>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.formTitle}>Unirse a una Sala</Text>
          <Text style={styles.formSubtitle}>
            Ingresa el código que te compartió tu pareja
          </Text>

          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="Código (6 caracteres)"
            placeholderTextColor="#999"
            value={joinCode}
            onChangeText={text => setJoinCode(text.toUpperCase())}
            editable={!loading}
            maxLength={6}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoinRoom}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>💕 Unirse a Sala</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}>
            <Text style={styles.scanButtonText}>📷 Escanear QR</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Pide a tu pareja el código de 6 caracteres
            </Text>
            <Text style={styles.infoText}>
              🔗 Una vez conectados, podrán compartir la pizarra
            </Text>
          </View>
        </View>
      )}

      {/* Modal Scanner QR */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <Camera
            style={styles.scanner}
            cameraType={CameraType.Back}
            scanBarcode
            onReadCode={handleQRScanned}
            showFrame
            laserColor="#FF6B9D"
            frameColor="#FFFFFF"
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerText}>Escanea el código QR</Text>
            <TouchableOpacity
              style={styles.closeScanner}
              onPress={() => setShowScanner(false)}>
              <Text style={styles.closeScannerText}>✕ Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5E5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  toggleActive: {
    backgroundColor: '#FF6B9D',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  formContainer: {
    marginHorizontal: 30,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  qrContainer: {
    flex: 1,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  qrTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  qrBox: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  qrCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
    letterSpacing: 4,
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  scannerText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFF',
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  closeScanner: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  closeScannerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    flex: 1,
  },
});

export default CreateRoomScreen;
