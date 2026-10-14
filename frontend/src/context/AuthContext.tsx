import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserDTO, RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO } from '@university-library/shared';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: UserDTO | null;
  isLoading: boolean;
  login: (credentials: LoginRequestDTO) => Promise<void>;
  register: (data: RegisterRequestDTO) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function checkAuthSession() {
      try {
        const response = await apiClient.get<AuthResponseDTO>('/auth/me');
        if (!ignore) {
          setUser(response.data.user);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    checkAuthSession();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (credentials: LoginRequestDTO) => {
    const response = await apiClient.post<AuthResponseDTO>('/auth/login', credentials);
    setUser(response.data.user);
  };

  const register = async (data: RegisterRequestDTO) => {
    const response = await apiClient.post<AuthResponseDTO>('/auth/register', data);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
