import { supabase } from '../lib/supabase';

export const notificationRepository = {
  async list() {
    const { data, error } = await supabase.from('notifications').select('id, title, body, read_at, created_at, type').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return data;
  },
  async markRead(id) {
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};
