import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants/storage';
import { loginUser, recoverAccount, registerUser, supabase } from '../services/supabase';
import { User } from '../types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const parseStoredUser = (rawUser: string | null): User | null => {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
};

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
      if (!supabase) {
        setUser(null);
        await persistUser(null);
        return;
      }

      const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.authUser);
      const parsedStoredUser = parseStoredUser(rawUser);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const restoredUser: User = {
          id: session.user.id,
          name:
            typeof session.user.user_metadata?.name === 'string'
              ? session.user.user_metadata.name
              : parsedStoredUser
                ? parsedStoredUser.name
                : 'Usuario Recetas RD',
          email: session.user.email ?? (parsedStoredUser ? parsedStoredUser.email : ''),
          avatarUrl: null,
        };

        setUser(restoredUser);
        await persistUser(restoredUser);
      } else {
        setUser(null);
        await persistUser(null);
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

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;

      if (!sessionUser) {
        setUser(null);
        await persistUser(null);
        return;
      }

      const storedUser = parseStoredUser(await AsyncStorage.getItem(STORAGE_KEYS.authUser));
      const nextUser: User = {
        id: sessionUser.id,
        name:
          typeof sessionUser.user_metadata?.name === 'string'
            ? sessionUser.user_metadata.name
            : storedUser?.name ?? 'Usuario Recetas RD',
        email: sessionUser.email ?? storedUser?.email ?? '',
        avatarUrl: null,
      };

      setUser(nextUser);

      await persistUser(nextUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [persistUser]);

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
      await registerUser({ name, email, password });
    },
    [],
  );

  const recoverPassword = useCallback(async (email: string) => {
    await recoverAccount(email);
  }, []);

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
      recoverPassword,
      logout,
    }),
    [isLoading, login, logout, recoverPassword, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};