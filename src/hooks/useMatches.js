import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { matchRepository } from '../repositories/matchRepository';

const key = ['matches'];
export const useMatches = (filters) => useQuery({ queryKey: [...key, filters], queryFn: () => matchRepository.list(filters) });
export const useMatch = (id) => useQuery({ queryKey: ['match', id], queryFn: () => matchRepository.getById(id), enabled: Boolean(id) });
export const useSaveMatch = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => id ? matchRepository.update(id, payload) : matchRepository.create(payload), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
};
