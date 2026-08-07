import { supabase } from '../lib/supabase';

export const teamRepository = {
  async list() {
    const { data, error } = await supabase.from('teams').select('id, name, short_name, color, logo_url, players(id, full_name, shirt_number, position, active)').order('name');
    if (error) throw error;
    return data;
  },
  async create(payload) {
    const { data, error } = await supabase.from('teams').insert(payload).select('id').single();
    if (error) throw error;
    return data;
  },
  async update(id, payload) {
    const { error } = await supabase.from('teams').update(payload).eq('id', id);
    if (error) throw error;
  },
  async delete(id) {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
  },
  async createPlayer(payload) {
    const { error } = await supabase.from('players').insert(payload);
    if (error) throw error;
  },
  async updatePlayer(id, payload) {
    const { error } = await supabase.from('players').update(payload).eq('id', id);
    if (error) throw error;
  },
};
