import { supabase } from '../lib/supabase';

export const settingsRepository = {
  async get() {
    const { data, error } = await supabase.from('settings').select('id, federation_name, season_name, support_email, updated_at').limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },
  async save(payload) {
    const { data: existing, error: selectError } = await supabase.from('settings').select('id').limit(1).maybeSingle();
    if (selectError) throw selectError;
    const query = existing ? supabase.from('settings').update(payload).eq('id', existing.id) : supabase.from('settings').insert(payload);
    const { error } = await query;
    if (error) throw error;
  },
};
