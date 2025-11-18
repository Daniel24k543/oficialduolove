import React, {useState, useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainApp from './src/screens/MainApp';

type Screen = 'onboarding' | 'login' | 'main';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      if (hasSeenOnboarding && isLoggedIn) {
        setCurrentScreen('main');
      } else if (hasSeenOnboarding) {
        setCurrentScreen('login');
      } else {
        setCurrentScreen('onboarding');
      }
    } catch (error) {
      console.log('Error checking first launch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setCurrentScreen('login');
  };

  const handleLoginSuccess = async () => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setCurrentScreen('main');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    setCurrentScreen('login');
  };

  if (isLoading) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
      {currentScreen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {currentScreen === 'main' && <MainApp onLogout={handleLogout} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
