'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {}
});

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('finance_theme');
    if (savedTheme === 'dark') {
      setDarkModeState(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setDarkModeState(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const setDarkMode = (isDark) => {
    setDarkModeState(isDark);
    const modeStr = isDark ? 'dark' : 'light';
    localStorage.setItem('finance_theme', modeStr);
    document.documentElement.setAttribute('data-theme', modeStr);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const currentTheme = {
    algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: darkMode
      ? {
          colorPrimary: '#3b82f6',
          colorBgBase: '#0f172a',
          colorBgContainer: '#1e293b',
          colorBorder: '#334155',
          colorBorderSecondary: '#334155',
          colorText: '#f8fafc',
          colorTextDescription: '#94a3b8',
          colorBgElevated: '#1e293b'
        }
      : {
          colorPrimary: '#2563eb',
          colorBgBase: '#ffffff',
          colorBgContainer: '#ffffff',
          colorBorder: '#e5e7eb',
          colorBorderSecondary: '#e5e7eb',
          colorText: '#1f2937',
          colorTextDescription: '#6b7280',
          colorBgElevated: '#ffffff'
        }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      <ConfigProvider theme={currentTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
