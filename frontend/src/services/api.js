import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await api.get('/requests/pending');
  return response.data;
};

export const createRequest = async (data) => {
  const response = await api.post('/requests', data);
  return response.data;
};

export const approveRequest = async (id, data) => {
  const response = await api.put(`/requests/approve/${id}`, data);
  return response.data;
};

export const rejectRequest = async (id, data) => {
  const response = await api.put(`/requests/reject/${id}`, data);
  return response.data;
};

export default api;
