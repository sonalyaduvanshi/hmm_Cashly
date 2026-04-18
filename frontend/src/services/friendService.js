import api from './api';

export const friendService = {
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },

  addFriend: async (data) => {
    const response = await api.post('/friends', data);
    return response.data;
  },

  updateFriend: async (id, data) => {
    const response = await api.put(`/friends/${id}`, data);
    return response.data;
  },

  deleteFriend: async (id) => {
    const response = await api.delete(`/friends/${id}`);
    return response.data;
  }
};