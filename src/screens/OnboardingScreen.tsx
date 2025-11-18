import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';


const {width, height} = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Conecta con tu pareja',
    description: 'Comparte momentos especiales juntos',
    backgroundColor: '#FFE5E5',
    emoji: '❤️',
  },
  {
    id: 2,
    title: 'Dibuja y expresa',
    description: 'Crea mensajes personalizados con la pizarra',
    backgroundColor: '#FFE0F0',
    emoji: '🎨',
  },
  {
    id: 3,
    title: 'Recuerdos compartidos',
    description: 'Guarda todos sus momentos especiales',
    backgroundColor: '#F0E5FF',
    emoji: '📸',
  },
  {
    id: 4,
    title: 'Mensajes de amor',
    description: 'Envía notas dulces en cualquier momento',
    backgroundColor: '#E5F0FF',
    emoji: '💌',
  },
  {
    id: 5,
    title: 'Siempre juntos',
    description: 'Widget en pantalla de inicio para estar conectados',
    backgroundColor: '#E5FFE5',
    emoji: '💑',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({onComplete}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentData = onboardingData[currentPage];

  return (
    <View
      style={[styles.container, {backgroundColor: currentData.backgroundColor}]}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>{currentData.emoji}</Text>
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentPage && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentPage === onboardingData.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF4757',
    width: 24,
  },
  button: {
    backgroundColor: '#FF4757',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;

