import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {firebaseService} from '../services/firebaseService';
import type {DrawingPath, UploadedImage} from '../services/firebaseService';

const {width, height} = Dimensions.get('window');

interface PathData {
  path: string;
  color: string;
  width: number;
}

const BoardScreen = () => {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [currentColor, setCurrentColor] = useState('#2196F3');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{uri: string; x: number; y: number}[]>([]);
  const [roomCode, setRoomCode] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // Inicializar sala y usuario
  useEffect(() => {
    const initRoom = async () => {
      // Obtener código de sala actual
      const roomData = await AsyncStorage.getItem('currentRoom');
      if (roomData) {
        const room = JSON.parse(roomData);
        setRoomCode(room.code);
      }

      // Obtener o crear ID de usuario
      let uid = auth().currentUser?.uid;
      if (!uid) {
        const result = await auth().signInAnonymously();
        uid = result.user.uid;
      }
      setUserId(uid);
    };

    initRoom();
  }, []);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = firebaseService.subscribeToRoom(roomCode, (roomData) => {
      // Actualizar paths
      if (roomData.paths) {
        const firebasePaths = roomData.paths.map((p: DrawingPath) => ({
          path: p.path,
          color: p.color,
          width: p.width,
        }));
        setPaths(firebasePaths);
      }

      // Actualizar imágenes
      if (roomData.images) {
        const firebaseImages = roomData.images.map((img: UploadedImage) => ({
          uri: img.url,
          x: img.x,
          y: img.y,
        }));
        setUploadedImages(firebaseImages);
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  const colors = ['#2196F3', '#FF4757', '#2ED573', '#FFA502', '#000000', '#FFFFFF'];

  const handleTouchStart = (event: any) => {
    const {locationX, locationY} = event.nativeEvent;
    setCurrentPath(`M ${locationX} ${locationY}`);
    setIsDrawing(true);
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing) return;
    const {locationX, locationY} = event.nativeEvent;
    setCurrentPath(prev => `${prev} L ${locationX} ${locationY}`);
  };

  const handleTouchEnd = async () => {
    if (currentPath && roomCode && userId) {
      const newPath = {path: currentPath, color: currentColor, width: brushSize};
      
      // Guardar en Firebase
      await firebaseService.addPath(roomCode, currentPath, currentColor, brushSize, userId);
      
      // Actualizar localmente (Firebase sync lo actualizará de todas formas)
      setPaths([...paths, newPath]);
      setCurrentPath('');
    }
    setIsDrawing(false);
  };

  const clearBoard = () => {
    Alert.alert('Limpiar Pizarra', '¿Estás seguro de que quieres borrar todo?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          if (roomCode) {
            await firebaseService.clearBoard(roomCode);
          }
          setPaths([]);
          setCurrentPath('');
          setUploadedImages([]);
        },
      },
    ]);
  };

  const undoLastPath = () => {
    if (paths.length > 0) {
      setPaths(paths.slice(0, -1));
    }
  };

  const handleUploadPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      async response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          Alert.alert('Error', 'No se pudo seleccionar la imagen');
          return;
        }

        if (response.assets && response.assets[0].uri && roomCode && userId) {
          const imageUri = response.assets[0].uri;
          
          try {
            // Subir a Firebase Storage
            await firebaseService.uploadImage(roomCode, imageUri, userId);
            Alert.alert('¡Éxito!', 'Foto subida y sincronizada');
          } catch (error) {
            console.error('Error subiendo imagen:', error);
            Alert.alert('Error', 'No se pudo subir la imagen');
          }
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pizarra</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="#666"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolButton} onPress={undoLastPath}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="#666"/>
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowTextInput(!showTextInput)}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M5 4v3h5.5v12h3V7H19V4z" fill="#666"/>
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={handleUploadPhoto}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#666"/>
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={clearBoard}>
          <Svg width="24" height="24" viewBox="0 0 24 24">
            <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#666"/>
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.colorPicker}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorButton,
              {backgroundColor: color},
              currentColor === color && styles.selectedColor,
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </View>

      <View
        style={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        <Svg height={height * 0.6} width={width}>
          {paths.map((item, index) => (
            <Path
              key={index}
              d={item.path}
              stroke={item.color}
              strokeWidth={item.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke={currentColor}
              strokeWidth={brushSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
        {uploadedImages.map((img, index) => (
          <Image
            key={index}
            source={{uri: img.uri}}
            style={{
              position: 'absolute',
              left: width / 2 - 125,
              top: height * 0.15,
              width: 250,
              height: 250,
              resizeMode: 'cover',
              borderRadius: 12,
              borderWidth: 3,
              borderColor: '#FF6B9D',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          />
        ))}
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.brushSizeLabel}>Grosor: {brushSize}</Text>
        <View style={styles.brushSizeContainer}>
          {[2, 4, 6, 8].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.brushSizeButton,
                brushSize === size && styles.selectedBrushSize,
              ]}
              onPress={() => setBrushSize(size)}>
              <View
                style={{
                  width: size * 2,
                  height: size * 2,
                  borderRadius: size,
                  backgroundColor: currentColor,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showTextInput && (
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Escribe tu texto..."
            value={textInput}
            onChangeText={setTextInput}
            multiline
          />
          <TouchableOpacity
            style={styles.addTextButton}
            onPress={() => {
              setShowTextInput(false);
              setTextInput('');
            }}>
            <Text style={styles.addTextButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toolButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    fontSize: 20,
  },
  colorPicker: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FF4757',
    borderWidth: 3,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  bottomBar: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  brushSizeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  brushSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  brushSizeButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
  },
  selectedBrushSize: {
    backgroundColor: '#FFE5E5',
  },
  textInputContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  addTextButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addTextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BoardScreen;

