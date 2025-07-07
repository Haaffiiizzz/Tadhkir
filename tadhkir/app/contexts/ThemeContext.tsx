import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'app_theme';

const ThemeContext = createContext<any>(null);

export const themes = {
  light: {
    background: '#f9f9f9',
    text: '#222',
    card: '#ffffff',
    salahItem: '#e0e0e0',
    salahText: '#222222',
    donePrayer: '#06d6a0',
    border: '#e0e0e0',
    nextPrayerBorder: '#fff',
    sectionBackground: '#ffffff',
    sectionBorder: '#dddddd',
  },
  dark: {
    background: '#25292e',
    text: '#ffffff',
    card: '#1e1e1e',
    salahItem: '#3a3f47',
    salahText: '#e0eaff',
    donePrayer: '#06d6a0',
    border: '#333333',
    nextPrayerBorder: '#fff',
    sectionBackground: '#2f3338',
    sectionBorder: '#444444',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('light');
  const [manualSet, setManualSet] = useState(false); // tracks if user picked manually

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        setManualSet(true);
      } else {
        const deviceTheme = Appearance.getColorScheme() || 'light';
        setTheme(deviceTheme);
      }
    })();
  }, []);

  useEffect(() => {
    if (!manualSet) {
      // Listen to device theme changes only if user didn't pick manual theme
      const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        if (colorScheme === 'light' || colorScheme === 'dark') setTheme(colorScheme);
      };
      const subscription = Appearance.addChangeListener(listener);
      return () => subscription.remove();
    }
  }, [manualSet]);

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setManualSet(true);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider
      value={{
        colors: themes[theme],
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
