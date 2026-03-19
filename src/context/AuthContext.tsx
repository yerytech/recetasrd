import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants/storage';
import { loginUser, registerUser, supabase } from '../services/supabase';
import { User } from '../types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Proveedor global de autenticación con persistencia local.
 */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      await AsyncStorage.removeItem(STORAGE_KEYS.authUser);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(nextUser));
  }, []);

  const hydrateAuth = useCallback(async () => {
    try {
      const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.authUser);

      if (rawUser) {
        const parsedUser = JSON.parse(rawUser) as User;
        setUser(parsedUser);
      }

      if (supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const restoredUser: User = {
            id: session.user.id,
            name:
              typeof session.user.user_metadata?.name === 'string'
                ? session.user.user_metadata.name
                : rawUser
                  ? (JSON.parse(rawUser) as User).name
                  : 'Usuario Recetas RD',
            email:
              session.user.email ?? (rawUser ? (JSON.parse(rawUser) as User).email : ''),
            avatarUrl: null,
          };

          setUser(restoredUser);
          await persistUser(restoredUser);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [persistUser]);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);
      await persistUser(loggedUser);
    },
    [persistUser],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const registeredUser = await registerUser({ name, email, password });
      setUser(registeredUser);
      await persistUser(registeredUser);
    },
    [persistUser],
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    await persistUser(null);
  }, [persistUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};