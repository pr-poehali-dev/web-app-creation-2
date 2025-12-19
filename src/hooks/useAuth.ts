import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/settings';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userId: number | null;
  isAdmin: boolean;
  isGuest: boolean;
}

export function useAuth(profile: UserProfile, setProfile: (profile: UserProfile) => void) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    userId: null,
    isAdmin: false,
    isGuest: true
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setAuthState({ ...auth, isGuest: !auth.isAuthenticated });
      } catch (e) {
        localStorage.removeItem('auth');
      }
    }
  }, []);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.username) return;

    const saveProfile = () => {
      try {
        localStorage.setItem(`profile_${authState.username}`, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to save profile:', e);
      }
    };

    const interval = setInterval(saveProfile, 5000);
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.username, profile]);

  const handleAuthSuccess = (username: string, userId: number, serverProfile: UserProfile, isAdmin: boolean) => {
    const auth = { isAuthenticated: true, username, userId, isAdmin, isGuest: false };
    setAuthState(auth);
    localStorage.setItem('auth', JSON.stringify(auth));
    setProfile(serverProfile);
  };

  const handleLogout = () => {
    setAuthState({ isAuthenticated: false, username: null, userId: null, isAdmin: false, isGuest: true });
    localStorage.removeItem('auth');
  };

  return {
    authState,
    handleAuthSuccess,
    handleLogout
  };
}
