import { supabase } from '../lib/supabase';

export const eventRepository = {
  async create(payload) {
    const { data, error } = await supabase.from('events').insert(payload).select('id').single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  },
};
