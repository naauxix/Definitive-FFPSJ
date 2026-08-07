import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (nextSession) => {
    setSession(nextSession);
    if (!nextSession?.user) { setAppUser(null); setLoading(false); return; }
    try {
      const currentUser = await userRepository.current(nextSession.user.id);
      setAppUser(currentUser);
    } catch (error) {
      console.error('No fue posible cargar el perfil de usuario', error);
      setAppUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { hydrate(nextSession); });
    return () => listener.subscription.unsubscribe();
  }, [hydrate]);

  const value = useMemo(() => ({
    session, appUser, loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    recoverPassword: authService.recoverPassword,
  }), [session, appUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  return context;
};
