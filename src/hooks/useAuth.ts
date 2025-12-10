import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/settings';

const AUTH_API = 'https://functions.poehali.dev/f895202d-2b99-4eae-a334-8b273bf2cbd1';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userId: number | null;
  isAdmin: boolean;
}

export function useAuth(profile: UserProfile, setProfile: (profile: UserProfile) => void) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    userId: null,
    isAdmin: false
  });

  // Загрузка сохраненной сессии
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setAuthState(auth);
      } catch (e) {
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // Автосохранение профиля на сервер каждые 5 секунд
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.username) return;

    const saveProfile = async () => {
      try {
        await fetch(AUTH_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_profile',
            username: authState.username,
            profile
          })
        });
      } catch (e) {
        console.error('Failed to save profile:', e);
      }
    };

    const interval = setInterval(saveProfile, 5000);
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.username, profile]);

  const handleAuthSuccess = (username: string, userId: number, serverProfile: UserProfile, isAdmin: boolean) => {
    const auth = { isAuthenticated: true, username, userId, isAdmin };
    setAuthState(auth);
    localStorage.setItem('auth', JSON.stringify(auth));
    setProfile(serverProfile);
  };

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false, username: null, userId: null, isAdmin: false });
    localStorage.removeItem('auth');
  };

  return {
    authState,
    handleAuthSuccess,
    handleLogout
  };
}