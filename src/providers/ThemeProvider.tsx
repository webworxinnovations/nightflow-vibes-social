
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark'); // Force dark theme

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Always apply dark theme
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Force dark theme styles
    document.body.style.backgroundColor = '#0a0a0a';
    document.body.style.color = '#ffffff';
  }, [theme]);

  const value = {
    theme: 'dark' as Theme, // Always return dark
    setTheme: (theme: Theme) => setTheme('dark'), // Always set to dark
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
