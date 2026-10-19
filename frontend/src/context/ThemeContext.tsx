import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'university-library-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Inicializar desde localStorage o sistema
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Buscar en localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // 2. Detectar preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    // 3. Default dark (actual del proyecto)
    return 'dark';
  });

  useEffect(() => {
    // Aplicar clase al html
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
