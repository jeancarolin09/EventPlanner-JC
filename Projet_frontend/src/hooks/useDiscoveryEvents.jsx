// Dans src/hooks/useDiscoveryEvents.js

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useDiscoveryEvents() {
  return useQuery({
    queryKey: ['discoveryEvents'],
    queryFn: async () => {
      const token = localStorage.getItem('jwt'); 
      // Le token est toujours requis, même pour le public, si votre route le demande

      if (!token) throw new Error('Utilisateur non authentifié'); 

      // 🛑 NOUVELLE URL POUR LES PUBLICATIONS PUBLIQUES
      const { data } = await axios.get('http://localhost:8000/api/events/public', {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      // Retourne la liste des événements publics
      return data['hydra:member'] || data;
    },
  });
}