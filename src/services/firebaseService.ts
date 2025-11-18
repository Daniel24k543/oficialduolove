import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export interface DrawingPath {
  path: string;
  color: string;
  width: number;
  timestamp: number;
  userId: string;
}

export interface UploadedImage {
  uri: string;
  storageUrl: string;
  x: number;
  y: number;
  timestamp: number;
  userId: string;
}

export interface RoomData {
  code: string;
  name: string;
  createdAt: string;
  members: string[];
  paths: DrawingPath[];
  images: UploadedImage[];
}

class FirebaseService {
  // Crear nueva sala
  async createRoom(roomCode: string, roomName: string, userId: string): Promise<void> {
    await firestore()
      .collection('rooms')
      .doc(roomCode)
      .set({
        code: roomCode,
        name: roomName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        members: [userId],
        paths: [],
        images: [],
      });
  }

  // Unirse a una sala
  async joinRoom(roomCode: string, userId: string): Promise<boolean> {
    const roomRef = firestore().collection('rooms').doc(roomCode);
    const room = await roomRef.get();

    if (!room.exists) {
      return false;
    }

    await roomRef.update({
      members: firestore.FieldValue.arrayUnion(userId),
    });

    return true;
  }

  // Escuchar cambios en la sala en tiempo real
  subscribeToRoom(
    roomCode: string,
    onUpdate: (data: RoomData) => void,
  ): () => void {
    return firestore()
      .collection('rooms')
      .doc(roomCode)
      .onSnapshot(snapshot => {
        if (snapshot.exists) {
          const data = snapshot.data() as RoomData;
          onUpdate(data);
        }
      });
  }

  // Agregar un trazo al canvas
  async addPath(
    roomCode: string,
    path: string,
    color: string,
    width: number,
    userId: string,
  ): Promise<void> {
    const newPath: DrawingPath = {
      path,
      color,
      width,
      timestamp: Date.now(),
      userId,
    };

    await firestore()
      .collection('rooms')
      .doc(roomCode)
      .update({
        paths: firestore.FieldValue.arrayUnion(newPath),
      });
  }

  // Subir imagen a Firebase Storage y guardar referencia
  async uploadImage(
    roomCode: string,
    imageUri: string,
    userId: string,
  ): Promise<void> {
    try {
      // Generar nombre único para la imagen
      const filename = `${roomCode}/${Date.now()}_${userId}.jpg`;
      const reference = storage().ref(filename);

      // Subir imagen
      await reference.putFile(imageUri);

      // Obtener URL de descarga
      const downloadUrl = await reference.getDownloadURL();

      // Guardar referencia en Firestore
      const newImage: UploadedImage = {
        uri: imageUri,
        storageUrl: downloadUrl,
        x: 0,
        y: 0,
        timestamp: Date.now(),
        userId,
      };

      await firestore()
        .collection('rooms')
        .doc(roomCode)
        .update({
          images: firestore.FieldValue.arrayUnion(newImage),
        });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Limpiar pizarra
  async clearBoard(roomCode: string): Promise<void> {
    await firestore()
      .collection('rooms')
      .doc(roomCode)
      .update({
        paths: [],
        images: [],
      });
  }

  // Verificar si una sala existe
  async roomExists(roomCode: string): Promise<boolean> {
    const room = await firestore().collection('rooms').doc(roomCode).get();
    return room.exists;
  }
}

export default new FirebaseService();
