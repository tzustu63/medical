import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { lightTheme, darkTheme } from '@/theme';
import AppNavigator from '@/navigation/AppNavigator';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [isDarkMode] = useState(false); // Can be connected to system preference

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    // Restore auth state from AsyncStorage
    const restoreAuth = async () => {
      try {
        const [accessToken, refreshToken, userJson] = await Promise.all([
          AsyncStorage.getItem('accessToken'),
          AsyncStorage.getItem('refreshToken'),
          AsyncStorage.getItem('user'),
        ]);

        if (accessToken && refreshToken && userJson) {
          const user = JSON.parse(userJson);
          store.dispatch(
            setCredentials({
              user,
              accessToken,
              refreshToken,
            })
          );
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
      } finally {
        setIsReady(true);
      }
    };

    restoreAuth();
  }, []);

  if (!isReady) {
    return null; // Or a splash screen
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.background}
            />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;

