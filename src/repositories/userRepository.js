import { supabase } from '../lib/supabase';

export const userRepository = {
  async current(id) {
    const baseSelect = 'id, email, role, status, profile:profiles(full_name, avatar_url)';
    let { data, error } = await supabase.from('users').select(`${baseSelect}, deactivated_at`).eq('id', id).single();
    // Permite iniciar sesión mientras se aplica la migración que añade deactivated_at.
    if (error?.message?.includes('deactivated_at')) {
      ({ data, error } = await supabase.from('users').select(baseSelect).eq('id', id).single());
    }
    if (error) throw error;
    return data;
  },
  async list() {
    const { data, error } = await supabase.from('users').select('id, email, role, status, created_at, profile:profiles(full_name, avatar_url)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async update(id, payload) {
    const { error } = await supabase.from('users').update(payload).eq('id', id);
    if (error) throw error;
  },
};
