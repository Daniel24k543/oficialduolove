import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  signInWithGoogle,
  signInWithFacebook,
  getAuthErrorMessage,
} from '../services/authService';
import EmailAuthScreen from './EmailAuthScreen';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);

  const handleEmailLogin = () => {
    setShowEmailAuth(true);
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      // await signInWithGoogle(); // Temporalmente deshabilitado
      Alert.alert('Demo', 'Google Sign-In deshabilitado temporalmente');
      setTimeout(() => onLoginSuccess(), 1000);
    } catch (error: any) {
      // El usuario canceló o hubo un error
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Error', getAuthErrorMessage(error));
      }
    } finally {
      setLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading('facebook');
    try {
      // await signInWithFacebook(); // Temporalmente deshabilitado
      Alert.alert('Demo', 'Facebook Login deshabilitado temporalmente');
      setTimeout(() => onLoginSuccess(), 1000);
    } catch (error: any) {
      // El usuario canceló o hubo un error
      if (!error.message?.includes('canceló')) {
        Alert.alert('Error', getAuthErrorMessage(error));
      }
    } finally {
      setLoading(null);
    }
  };

  // Si estamos en la pantalla de Email, mostrar EmailAuthScreen
  if (showEmailAuth) {
    return (
      <EmailAuthScreen
        onLoginSuccess={onLoginSuccess}
        onBack={() => setShowEmailAuth(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={{flex: 1}}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Duo Love</Text>
              <Text style={styles.subtitle}>Conecta. Ama. Vive.</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.googleButton]}
                onPress={handleGoogleLogin}
                disabled={loading !== null}>
                {loading === 'google' ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <Text style={styles.googleButtonText}>
                     Continuar con Google
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.facebookButton]}
                onPress={handleFacebookLogin}
                disabled={loading !== null}>
                {loading === 'facebook' ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.facebookButtonText}>
                    f Continuar con Facebook
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.emailButton]}
                onPress={handleEmailLogin}
                disabled={loading !== null}>
                <Text style={styles.emailButtonText}>
                   Continuar con Email
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Al continuar, aceptas nuestros términos y condiciones
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#FFF',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  facebookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#4CAF50',
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});

export default LoginScreen;
