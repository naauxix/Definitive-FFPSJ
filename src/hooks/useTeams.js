import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamRepository } from '../repositories/teamRepository';

export const useTeams = () => useQuery({ queryKey: ['teams'], queryFn: teamRepository.list });
export const useCreateTeam = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: teamRepository.create, onSuccess: () => client.invalidateQueries({ queryKey: ['teams'] }) });
};
export const useCreatePlayer = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: teamRepository.createPlayer, onSuccess: () => client.invalidateQueries({ queryKey: ['teams'] }) });
};
