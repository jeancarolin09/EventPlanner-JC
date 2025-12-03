// hooks/useMessaging.js
import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:8000/api/conversations';

export const useMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const jwt = localStorage.getItem('jwt');

  const headers = {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  };

  // Récupérer toutes les conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, { headers });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  // Créer ou trouver une conversation
  const createOrFindConversation = useCallback(async (participantIds) => {
    try {
      const res = await fetch(`${API_BASE}/create-or-find`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ participantIds })
      });
      if (!res.ok) throw new Error('Failed to create/find conversation');
      const data = await res.json();
      return data.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [jwt]);

  // Récupérer les messages d'une conversation
  const fetchMessages = useCallback(async (conversationId, page = 1, limit = 50) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/${conversationId}/messages?page=${page}&limit=${limit}`,
        { headers }
      );
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      const res = await fetch(`${API_BASE}/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to send message');
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      return newMsg;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [jwt]);

  // Éditer un message
  const editMessage = useCallback(async (messageId, content) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to edit message');
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content, editedAt: new Date().toISOString() } : msg
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [jwt]);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete message');
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [jwt]);

  // Nettoyer les erreurs
  const clearError = useCallback(() => setError(null), []);

  return {
    conversations,
    messages,
    loading,
    error,
    clearError,
    fetchConversations,
    createOrFindConversation,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage
  };
};