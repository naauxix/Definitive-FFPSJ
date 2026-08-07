import { supabase } from '../lib/supabase';

export const authService = {
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signUp: ({ fullName, email, password }) => supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
  // Cierra la sesión almacenada en este equipo incluso si no hay conexión.
  signOut: () => supabase.auth.signOut({ scope: 'local' }),
  recoverPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` }),
  updatePassword: (password) => supabase.auth.updateUser({ password }),
};
