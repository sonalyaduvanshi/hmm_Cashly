import api from './api';

export const splitService = {
  getSplits: async () => {
    const response = await api.get('/splits');
    return response.data;
  },

  createSplit: async (data) => {
    const response = await api.post('/splits', data);
    return response.data;
  },

  settleUp: async (data) => {
    const response = await api.post('/splits/settle', data);
    return response.data;
  }
};