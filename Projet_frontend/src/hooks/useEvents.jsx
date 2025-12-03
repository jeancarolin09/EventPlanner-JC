import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const token = localStorage.getItem('jwt'); // récupère le JWT

      if (!token) throw new Error('Utilisateur non authentifié');

      const { data } = await axios.get('http://localhost:8000/api/events', {
        headers: {
          Authorization: `Bearer ${token}`, // ajoute le token au header
          'Content-Type': 'application/json',
        },
      });

      return data['hydra:member'] || data; // pour API Platform
    },
  });
}
