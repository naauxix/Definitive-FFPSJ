import { supabase } from '../lib/supabase';

const matchDetailSelect = `
  id, scheduled_at, venue, competition, round, status, home_score, away_score, observations, created_at,
  home_team:teams!matches_home_team_id_fkey(id, name, short_name, color),
  away_team:teams!matches_away_team_id_fkey(id, name, short_name, color),
  referee:profiles!matches_assigned_referee_id_fkey(id, full_name, avatar_url)
`;

export const matchRepository = {
  async list({ from, to } = {}) {
    let query = supabase.from('matches').select(matchDetailSelect).order('scheduled_at', { ascending: true });
    if (from) query = query.gte('scheduled_at', from);
    if (to) query = query.lte('scheduled_at', to);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase.from('matches').select(`${matchDetailSelect}, match_players(id, team_id, shirt_number, position, starter, player:players(id, full_name, document_number)), events(id, event_type, minute, period, description, team_id, player:players(id, full_name), created_at)`).eq('id', id).single();
    if (error) throw error;
    return data;
  },
  async create(payload) {
    const { data, error } = await supabase.from('matches').insert(payload).select('id').single();
    if (error) throw error;
    return data;
  },
  async update(id, payload) {
    const { data, error } = await supabase.from('matches').update(payload).eq('id', id).select('id').single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) throw error;
  },
  async saveLineup(matchId, lines) {
    const { error: deleteError } = await supabase.from('match_players').delete().eq('match_id', matchId);
    if (deleteError) throw deleteError;
    if (!lines.length) return;
    const { error } = await supabase.from('match_players').insert(lines.map((line) => ({ ...line, match_id: matchId })));
    if (error) throw error;
  },
};
