import api from './axios.js';

export const getConversations = () => api.get('/conversations');

export const createConversation = (tone = 'Professional') =>
  api.post('/conversations', { tone });

export const getConversation = (id) => api.get(`/conversations/${id}`);

export const deleteConversation = (id) => api.delete(`/conversations/${id}`);

export const updateTone = (id, tone) =>
  api.patch(`/conversations/${id}/tone`, { tone });
