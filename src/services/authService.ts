import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { GOOGLE_WEB_CLIENT_ID } from '../config/firebase';

/**
 * Servicio de Autenticación para DuoLoveFresh
 * Maneja Google Sign-In, Facebook Login y Email/Password
 */

// ========== Configuración Inicial ==========

/**
 * Configura Google Sign-In
 * Debe ser llamado al iniciar la app
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

// ========== Google Sign-In ==========

/**
 * Inicia sesión con Google
 * @returns Usuario autenticado de Firebase
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    // Verifica que Google Play Services esté disponible
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Obtiene el ID token de Google
    const { idToken } = await GoogleSignin.signIn();

    if (!idToken) {
      throw new Error('No se pudo obtener el token de Google');
    }

    // Crea credenciales de Firebase con el token de Google
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Inicia sesión en Firebase con las credenciales de Google
    return await auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error('Error en Google Sign-In:', error);
    throw error;
  }
};

/**
 * Cierra sesión de Google
 */
export const signOutGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error al cerrar sesión de Google:', error);
  }
};

// ========== Facebook Login ==========

/**
 * Inicia sesión con Facebook
 * @returns Usuario autenticado de Firebase
 */
export const signInWithFacebook = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    // Intenta iniciar sesión con Facebook
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw new Error('El usuario canceló el inicio de sesión con Facebook');
    }

    // Obtiene el token de acceso de Facebook
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw new Error('No se pudo obtener el token de acceso de Facebook');
    }

    // Crea credenciales de Firebase con el token de Facebook
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    // Inicia sesión en Firebase con las credenciales de Facebook
    return await auth().signInWithCredential(facebookCredential);
  } catch (error) {
    console.error('Error en Facebook Login:', error);
    throw error;
  }
};

/**
 * Cierra sesión de Facebook
 */
export const signOutFacebook = async (): Promise<void> => {
  try {
    await LoginManager.logOut();
  } catch (error) {
    console.error('Error al cerrar sesión de Facebook:', error);
  }
};

// ========== Email/Password ==========

/**
 * Registra un nuevo usuario con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Usuario autenticado de Firebase
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await auth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Inicia sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Usuario autenticado de Firebase
 */
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    return await auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Envía email de recuperación de contraseña
 * @param email - Email del usuario
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw error;
  }
};

// ========== Gestión de Sesión ==========

/**
 * Cierra sesión del usuario actual
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth().signOut();
    await signOutGoogle();
    await signOutFacebook();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/**
 * Obtiene el usuario actual
 * @returns Usuario actual o null si no hay sesión activa
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

/**
 * Actualiza el perfil del usuario
 * @param displayName - Nombre a mostrar
 * @param photoURL - URL de la foto de perfil
 */
export const updateUserProfile = async (
  displayName?: string,
  photoURL?: string,
): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    await user.updateProfile({
      displayName,
      photoURL,
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

/**
 * Suscribe a cambios en el estado de autenticación
 * @param callback - Función que se ejecuta cuando cambia el estado
 * @returns Función para cancelar la suscripción
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
): (() => void) => {
  return auth().onAuthStateChanged(callback);
};

// ========== Manejo de Errores ==========

/**
 * Convierte errores de Firebase a mensajes legibles
 * @param error - Error de Firebase
 * @returns Mensaje de error en español
 */
export const getAuthErrorMessage = (error: any): string => {
  const errorCode = error.code;

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este email ya está registrado';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    default:
      return 'Error al autenticar. Intenta de nuevo';
  }
};
