import React, { createContext, useContext, useState, useEffect } from 'react';
import { darkColors, lightColors } from './colors';
import { getSetting } from '../database/database';

const ThemeContext = createContext({ colors: darkColors, theme: 'dark', setTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');
  const [themeColors, setThemeColors] = useState(darkColors);

  useEffect(() => {
    try {
      const saved = getSetting('theme');
      if (saved) {
        setThemeState(saved);
        setThemeColors(saved === 'light' ? lightColors : darkColors);
      }
    } catch (e) {}
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    setThemeColors(newTheme === 'light' ? lightColors : darkColors);
  };

  return (
    <ThemeContext.Provider value={{ colors: themeColors, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);